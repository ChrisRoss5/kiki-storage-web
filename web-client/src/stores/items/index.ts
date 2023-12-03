import { useItemsFirestoreStore } from "@/stores/items/firestore";
import { _createFolder, checkItem, convertFilesToItems } from "@/utils/item";
import { clearDragOverStyle } from "@/utils/style";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { _RefFirestore } from "vuefire";
import { usePathStore } from "../path";
import { useShortDialogStore } from "../short-dialog";
import { useItemsStorageStore } from "./storage";

function createItemsStore(this: { isSearch: boolean }) {
  const dialogStore = useShortDialogStore();
  const pathStore = usePathStore();
  const { api: firestoreApi } = useItemsFirestoreStore();
  const { api: storageApi } = useItemsStorageStore();
  const otherStore = useItemsStore(!this.isSearch);

  const dbItems = ref<_RefFirestore<ItemCore[]>>();
  const items = ref<Item[]>([]);
  const itemsPending = computed(() => !!dbItems.value?.pending);
  const selectedItems = computed(() => items.value.filter((i) => i.isSelected));
  const newFolderName = ref("");

  const stopDbItems = () => dbItems.value?.stop();
  const setDbItems = (newItems: _RefFirestore<ItemCore[]>) => {
    dbItems.value = newItems;
  };
  const setItems = () => {
    const newDbItems = dbItems.value?.value;
    if (!newDbItems || itemsPending.value) return;
    /* console.log(
      `UPDATING ${this.isSearch ? "SEARCH " : ""}ITEMS: `,
      newDbItems.length,
    ); */
    items.value = newDbItems.map((newDbItem) =>
      Object.assign(
        otherStore.items.find((i) => i.id == newDbItem.id) ??
          items.value.find((i) => i.id == newDbItem.id) ?? { ...newDbItem },
        newDbItem,
      ),
    );
    // ItemCore will overwrite Item's previous Core values while keeping state
  };

  // VUEFIRE BUG: pending is false when it should be true!
  watch(itemsPending, setItems); // BUGFIX!
  watch(() => dbItems.value?.data, setItems, { deep: true });

  const areItemsInvalid = async (newItems: Item[], path: string) => {
    const scopedItems =
      path == pathStore.currentPath
        ? items.value
        : await firestoreApi.getItems(path, false, { once: true }).promise
            .value;
    return newItems.some((i) => isItemInvalid(i, scopedItems));
  };
  const isItemInvalid = (item: Item, _items?: Item[]) => {
    const { error } = checkItem(item, _items ?? items.value);
    if (error) dialogStore.showError(error);
    return !!error;
  };
  const handleDrop = (e: DragEvent, path?: string) => {
    path ??= pathStore.currentPath;
    clearDragOverStyle(e);
    const itemsData = e.dataTransfer?.getData("items");
    if (itemsData) handleMove(JSON.parse(itemsData), path);
    else if (e.dataTransfer) createFiles(e.dataTransfer.files, path);
  };
  const handleMove = async (items: Item[], path: string) => {
    if (await areItemsInvalid(items, path)) return;
    const folders = items.filter((i) => i.isFolder);
    const msg = "You can't move a folder into its own subfolder.";
    if (
      folders.some((f) =>
        path.startsWith(`${f.path ? `${f.path}/` : ""}${f.name}`),
      )
    )
      return dialogStore.showError(msg);
    items = items.filter(
      (i) =>
        !folders.some((f) =>
          i.path.startsWith(`${f.path ? `${f.path}/` : ""}${f.name}`),
        ),
    );
    firestoreApi.moveItems(items, path);
  };
  const createFolder = async () => {
    const item = _createFolder(newFolderName.value, pathStore.currentPath);
    if (isItemInvalid(item)) return;
    newFolderName.value = "";
    firestoreApi.createItem(item);
  };
  const createFiles = async (files: FileList, path?: string) => {
    path ??= pathStore.currentPath;
    let newItems = convertFilesToItems(files, path);
    if (!newItems.length)
      return dialogStore.showError("No valid files were selected.");
    if (await areItemsInvalid(newItems, path)) return;
    storageApi.createFiles(newItems, files);
  };
  const deleteItems = async () => {
    const _items = selectedItems.value;
    const toDelete = _items.length > 1 ? `${_items.length} items` : "one item";
    const message = `Are you sure you want to delete ${toDelete}?`;
    if (!(await dialogStore.confirm(message))) return;
    firestoreApi.deleteItems(_items);
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
    handleDrop,
    createFolder,
    createFiles,
    deleteItems,
    renameItem,
    stopRenaming,
    selectAll,
    deselectAll,
  };
}

export const itemsStore = defineStore(
  "items",
  createItemsStore.bind({ isSearch: false }),
);
export const searchItemsStore = defineStore(
  "search-items",
  createItemsStore.bind({ isSearch: true }),
);

export const useItemsStore = (isSearch = false) =>
  isSearch ? searchItemsStore() : itemsStore();

export type ItemsStore = ReturnType<typeof useItemsStore>;
