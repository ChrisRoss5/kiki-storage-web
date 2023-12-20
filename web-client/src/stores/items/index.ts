import { useItemsFirestoreStore } from "@/stores/items/firestore";
import {
  _createFolder,
  checkItem,
  convertFilesToItems,
  getFullPath,
} from "@/utils/item";
import { clearDragOverStyle } from "@/utils/style";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { _RefFirestore } from "vuefire";
import { usePathStore } from "../path";
import { useSearchStore } from "../search";
import { RootKey } from "../settings/default";
import { useShortDialogStore } from "../short-dialog";
import { useItemsStorageStore } from "./storage";

export function createItemsStore(this: { id: ItemsStoreId }) {
  const dialogStore = useShortDialogStore();
  const pathStore = usePathStore();
  const { api: firestoreApi } = useItemsFirestoreStore();
  const { api: storageApi } = useItemsStorageStore();
  const searchStore = useSearchStore();

  const dbItems = ref<_RefFirestore<ItemCore[]>>();
  const items = ref<Item[]>([]);

  const newFolderName = ref("");
  const isFocused = ref(false);
  const isOpen = ref(false);
  const path = ref(
    this.id.startsWith("tree-items-") ? this.id.replace("tree-items-", "") : "",
  );

  const itemsPending = computed(() => !!dbItems.value?.pending);
  const selectedItems = computed(() => items.value.filter((i) => i.isSelected));
  const root = computed(() => path.value.split("/")[0] as RootKey);

  const $reset = () => {
    dbItems.value = undefined;
    items.value = [];
  };

  const stopDbItems = () => dbItems.value?.stop(); // unused
  const setDbItems = (newItems: _RefFirestore<ItemCore[]>) => {
    // All paths are being watched, but in the future it may be necessary to stop watchers
    // depending on the usage (dbItems.value?.stop();)
    // https://cloud.google.com/firestore/pricing
    // https://firebase.google.com/docs/firestore/quotas#writes_and_transactions
    dbItems.value = newItems;
  };
  const setItems = () => {
    const newDbItems = dbItems.value?.value;
    if (!newDbItems || itemsPending.value) return;
    const _stores = stores.map((s) => s()).reverse();
   /*  console.log("setItems", this.id); //todo: remove
    console.log(_stores.length); */

    items.value = newDbItems
      // Unsupported firestore query filters
      .filter((newDbItem) => {
        if (this.id != "search-items") return true;
        return (
          newDbItem.name
            .toLowerCase()
            .startsWith(searchStore.filters.query.toLowerCase()) &&
          newDbItem.path.startsWith(pathStore.currentRoot)
        );
      })
      // ItemCore will overwrite Item's previous Core values while keeping state
      .map((newDbItem) => {
        let prevItem: Item | undefined;
        for (const store of _stores) {
          prevItem = store.items.find((item) => item.id == newDbItem.id);
          if (prevItem) break;
        }
        return Object.assign(prevItem ?? { ...newDbItem }, newDbItem);
      });
  };

  // VUEFIRE BUG: pending is false when it should be true!
  watch(itemsPending, setItems); // BUGFIX!
  watch(() => dbItems.value?.data, setItems, { deep: true });
  watch(
    path,
    (newPath) => newPath && setDbItems(firestoreApi.getItems(newPath)), // warn: onServerPrefetch
    { immediate: true },
  );

  const areItemsInvalid = async (newItems: Item[], _path: string) => {
    const scopedItems =
      _path == path.value
        ? items.value
        : await firestoreApi.getItems(_path).promise.value;
    return newItems.some((i) => isItemInvalid(i, scopedItems));
  };
  const isItemInvalid = (item: Item, _items?: Item[]) => {
    const { error } = checkItem(item, _items ?? items.value);
    if (error) dialogStore.showError(error);
    return !!error;
  };
  const handleDrop = (e: DragEvent, _path: string) => {
    clearDragOverStyle(e);
    const itemsData = e.dataTransfer?.getData("items");
    if (itemsData) handleMove(JSON.parse(itemsData), _path);
    else if (e.dataTransfer) createFiles(e.dataTransfer.files, _path);
  };
  const handleMove = async (items: Item[], _path: string) => {
    if ((_path as RootKey) != "bin" && (await areItemsInvalid(items, _path)))
      return;
    const folders = items.filter((i) => i.isFolder);
    const msg = "You can't move a folder into its own subfolder.";
    if (folders.some((f) => _path.startsWith(getFullPath(f))))
      return dialogStore.showError(msg);
    items = items.filter(
      (i) => !folders.some((f) => i.path.startsWith(getFullPath(f))),
    );
    firestoreApi.moveItems(items, _path);
  };
  const createFolder = async () => {
    const item = _createFolder(newFolderName.value, path.value);
    if (isItemInvalid(item)) return;
    newFolderName.value = "";
    firestoreApi.createItem(item);
  };
  const createFiles = async (files: FileList, _path?: string) => {
    _path ??= path.value;
    let newItems = convertFilesToItems(files, _path);
    if (!newItems.length)
      return dialogStore.showError("No valid files were selected.");
    if (await areItemsInvalid(newItems, _path)) return;
    storageApi.createFiles(newItems, files);
  };
  const deleteItems = async () => {
    const permanent = root.value == "bin";
    const _items = selectedItems.value;
    const toDelete = _items.length > 1 ? `${_items.length} items` : "one item";
    const message = `Are you sure you want to delete ${toDelete}${
      permanent ? " permanently" : ""
    }?`;
    if (!(await dialogStore.confirm(message))) return;
    if (!permanent) handleMove(_items, "bin" satisfies RootKey);
    else firestoreApi.deleteItemsPermanently(_items);
  };
  const renameItem = async (item: Item) => {
    if (!item.newName) return;
    item.isRenaming = item.newName != item.name;
    if (!item.isRenaming || isItemInvalid({ ...item, name: item.newName }))
      return;
    firestoreApi.renameItem(item);
    item.isRenaming = false;
  };
  const stopRenaming = () => {
    const item = items.value.find((i) => i.isRenaming);
    if (item) item.isRenaming = false;
  };
  const selectAll = () => items.value.forEach((i) => (i.isSelected = true));
  const deselectAll = () => items.value.forEach((i) => (i.isSelected = false));

  return {
    dbItems,
    setDbItems,
    stopDbItems,
    items,
    itemsPending,
    selectedItems,
    newFolderName,
    isFocused,
    isOpen,
    path,
    root,
    handleDrop,
    createFolder,
    createFiles,
    deleteItems,
    renameItem,
    stopRenaming,
    selectAll,
    deselectAll,
    $reset,
  };
}

const itemsStoreIds = ["items", "search-items", "navbar-items"] as const;

// https://stackoverflow.com/questions/74467392/autocomplete-in-typescript-of-literal-type-and-string
type ItemsStoreId = (typeof itemsStoreIds)[number] | (string & {}); // nosonar

const _defineStore = (id: ItemsStoreId) =>
  defineStore(id, createItemsStore.bind({ id }));

export const useTreeStore = (path: string) => {
  const existingStore = stores.find((s) => s().$id == `tree-items-${path}`);
  if (existingStore) return existingStore();
  const newStore = _defineStore(`tree-items-${path}`);
  stores.push(newStore);
  return newStore();
};

export const stores = itemsStoreIds.map(_defineStore);
export const useItemsStore = stores[0];
export const useSearchItemsStore = stores[1];
export const useNavbarItemsStore = stores[2];

export type ItemsStore = ReturnType<ReturnType<typeof _defineStore>>;
