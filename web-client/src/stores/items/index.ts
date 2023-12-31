import { useItemsFirestoreStore } from "@/stores/items/firebase/firestore";
import {
  createFolder as _createFolder,
  checkItem,
  convertFilesToItems,
  getFullPath,
} from "@/utils/item";
import { clearDragOverStyle } from "@/utils/style";
import { computed, ref, watch } from "vue";
import { _RefFirestore, useCurrentUser } from "vuefire";
import { usePathStore } from "../path";
import { useSearchStore } from "../search";
import { useSettingsStore } from "../settings";
import { RootKey } from "../settings/default";
import { useShortDialogStore } from "../short-dialog";
import { useItemStorageStore } from "./firebase/storage";
import { ItemStoreId, getAllItemStores } from "./manager";

export type ItemStoreBindings = { id: ItemStoreId; path?: string };

export function createItemStore(this: ItemStoreBindings) {
  const dialogStore = useShortDialogStore();
  const pathStore = usePathStore();
  const { api: firestoreApi } = useItemsFirestoreStore();
  const { api: storageApi } = useItemStorageStore();
  const searchStore = useSearchStore();
  const user = useCurrentUser();
  const settingsStore = useSettingsStore();

  const dbItems = ref<_RefFirestore<ItemCore[]>>();
  const items = ref<Item[]>([]);
  const newFolderName = ref("");
  const isOpen = ref(false); // Search & NavbarExplorer
  const path = ref(this.path ?? "");

  const itemsPending = computed(() => !!dbItems.value?.pending);
  const selectedItems = computed(() =>
    items.value.filter(
      (i) =>
        i.isSelected && (!settingsStore.settings.hideFilesInTree || i.isFolder),
    ),
  );
  const root = computed(() => path.value.split("/")[0] as RootKey);

  const $reset = () => {
    dbItems.value = undefined;
    items.value = [];
    newFolderName.value = "";
    isOpen.value = false;
    path.value = this.path ?? "";
  };

  const setDbItems = (newItems: _RefFirestore<ItemCore[]>) => {
    // All paths are being watched, but in the future it may be necessary to stop watchers
    // depending on the usage (dbItems.value?.stop();)
    // Currently, watchers are super cheap and without a limit.
    // https://cloud.google.com/firestore/pricing
    // https://firebase.google.com/docs/firestore/quotas#writes_and_transactions
    dbItems.value = newItems;
  };
  const setItems = () => {
    const newDbItems = dbItems.value?.value;
    if (!newDbItems || itemsPending.value) return;
    const _stores = getAllItemStores();
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
          prevItem = store.items.find((i) => i.id == newDbItem.id);
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
  const handleDrop = (e: DragEvent, _path?: string) => {
    _path ??= path.value;
    clearDragOverStyle(e);
    const itemsDragDataStr = e.dataTransfer?.getData("ItemsDragData");
    if (itemsDragDataStr) {
      try {
        const { items, uid } = JSON.parse(itemsDragDataStr) as ItemsDragData;
        if (uid != user.value?.uid)
          return dialogStore.showError("You can't move someone else's items.");
        handleMove(items, _path);
      } catch {
        location.reload(); // Can only happen if user is unauthorized after too long
      }
    } else if (e.dataTransfer) createFiles(e.dataTransfer.files, _path);
  };
  const handleMove = async (items: Item[], _path?: string) => {
    _path ??= path.value;
    if (_path != ("bin" as RootKey) && (await areItemsInvalid(items, _path)))
      return;
    const folders = items.filter((i) => i.isFolder);
    const msg = "You can't move a folder into itself or its own subfolder.";
    if (folders.some((f) => _path!.startsWith(getFullPath(f))))
      return dialogStore.showError(msg);
    items = items.filter(
      (i) => !folders.some((f) => i.path.startsWith(getFullPath(f))),
    );
    firestoreApi.moveItems(items, _path);
  };
  const handleCopy = async (items: Item[], _path?: string) => {
    dialogStore.showError("Copying is not supported yet.");
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
    const s1 = _items.length > 1 ? `${_items.length} items` : "one item";
    const s2 = `${s1}${permanent ? " permanently" : ""}`;
    const message = `Are you sure you want to delete ${s2}?`;
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
  const invertSelection = () =>
    items.value.forEach((i) => (i.isSelected = !i.isSelected));

  return {
    setDbItems,
    items,
    itemsPending,
    selectedItems,
    newFolderName,
    isOpen,
    path,
    root,
    handleDrop,
    handleMove,
    handleCopy,
    createFolder,
    createFiles,
    deleteItems,
    renameItem,
    stopRenaming,
    selectAll,
    deselectAll,
    invertSelection,
    $reset,
  };
}
