import { useItemsFirestoreStore } from "@/stores/items/firestore";
import { _createFolder, checkItem, convertFilesToItems } from "@/utils/item";
import { clearDragOverStyle } from "@/utils/style";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { _RefFirestore } from "vuefire";
import { usePathStore } from "../path";
import { useShortDialogStore } from "../short-dialog";

function createItemsStore(this: { isSearch: boolean }) {
  const dialogStore = useShortDialogStore();
  const pathStore = usePathStore();
  const { api } = useItemsFirestoreStore();
  const otherStore = useItemsStore(!this.isSearch);

  const dbItems = ref<_RefFirestore<ItemCore[]>>();
  const items = ref<Item[]>([]);
  const selectedItems = computed(() => items.value.filter((i) => i.isSelected));
  const newFolderName = ref("");

  const setDbItems = (newItems: _RefFirestore<ItemCore[]>) =>
    (dbItems.value = newItems);
  const stopDbItems = () => dbItems.value?.stop();

  watch(
    dbItems,
    (newDbItems) => {
      if (!newDbItems) return;
      console.log(
        `UPDATING ${this.isSearch ? "SEARCH" : ""} ITEMS: `,
        newDbItems.value.length,
      );
      items.value = newDbItems.value.map(
        (newDbItem) =>
          otherStore.items.find((i) => i.id == newDbItem.id) ?? {
            ...items.value.find((i) => i.id == newDbItem.id),
            ...newDbItem, // ItemCore will overwrite Item's previous Core values while keeping state
          },
      );
      //.map((i) => otherStore.items.find((i2) => i2.id == i.id) || i);
    },
    { deep: true },
  );

  const areItemsInvalid = async (newItems: Item[], path: string) => {
    const scopedItems =
      path == pathStore.currentPath
        ? items.value
        : await api.getItems(path, false, { once: true }).promise.value;
    return newItems.some((i) => isItemInvalid(i, scopedItems));
  };
  const isItemInvalid = (item: Item, _items?: Item[]) => {
    const { error } = checkItem(item, _items ?? items.value);
    if (error) dialogStore.showError(error);
    return !!error;
  };
  const handleDrop = async (e: DragEvent, path?: string) => {
    path ??= pathStore.currentPath;
    clearDragOverStyle(e);
    const itemsData = e.dataTransfer?.getData("items");
    if (itemsData) {
      let newItems = JSON.parse(itemsData) as Item[];
      if (await areItemsInvalid(newItems, path)) return;
      const folders = newItems.filter((i) => i.isFolder);
      if (folders.some((f) => path!.startsWith(f.path + f.name)))
        return dialogStore.showError(
          "You can't move a folder into its own subfolder.",
        );
      newItems = newItems.filter((i) => {
        return !folders.some((f) => i.path.startsWith(f.path + f.name));
      });
      api.moveItems(newItems, path);
    } else if (e.dataTransfer) createFiles(e.dataTransfer.files, path);
  };
  const createFolder = async () => {
    const item = _createFolder(newFolderName.value, pathStore.currentPath);
    if (isItemInvalid(item)) return;
    newFolderName.value = "";
    api.createItem(item);
  };
  const createFiles = async (files: FileList, path?: string) => {
    path ??= pathStore.currentPath;
    let newItems = convertFilesToItems(files, path);
    if (!newItems.length)
      return dialogStore.showError("No valid files were selected.");
    if (await areItemsInvalid(newItems, path)) return;
    api.createItems(newItems);
  };
  const deleteItems = async () => {
    const _items = selectedItems.value;
    const toDelete = _items.length > 1 ? `${_items.length} items` : "one item";
    const message = `Are you sure you want to delete ${toDelete}?`;
    if (!(await dialogStore.confirm(message))) return;
    api.deleteItems(_items);
  };
  const renameItem = async (item: Item) => {
    if (!item.newName) return;
    item.isRenaming = item.newName != item.name;
    if (!item.isRenaming || isItemInvalid({ ...item, name: item.newName }))
      return;
    api.renameItem(item);
    item.isRenaming = false;
  };
  const selectAll = () => items.value.forEach((i) => (i.isSelected = true));
  const deselectAll = () => items.value.forEach((i) => (i.isSelected = false));

  return {
    dbItems,
    setDbItems,
    stopDbItems,
    items,
    selectedItems,
    newFolderName,
    handleDrop,
    createFolder,
    createFiles,
    deleteItems,
    renameItem,
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
