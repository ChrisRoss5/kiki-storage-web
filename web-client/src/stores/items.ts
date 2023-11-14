//import api from "@/firebase/sql-server-api";
import api from "@/firebase/firestore-api";
import { _createFolder, checkItem, convertFilesToItems } from "@/utils/item";
import { clearDragOverStyle } from "@/utils/style";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { usePathStore } from "./path";
import { useSearchStore } from "./search";
import { useShortDialogStore } from "./short-dialog";

const itemsStore = () => {
  const itemsManager = useItemsManager();
  const dialogStore = useShortDialogStore();
  const pathStore = usePathStore();

  const items = ref<Item[]>([]);
  const selectedItems = computed(() => items.value.filter((i) => i.isSelected));
  const newFolderName = ref("");

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
      if (path == pathStore.currentPath) return; // todo check if items are from outside window
      const newItems = JSON.parse(itemsData) as Item[];
      if (await areItemsInvalid(newItems, path)) return;
      const folders = newItems.filter((i) => i.isFolder);
      if (
        folders.some((f) => f.path.length) ||
        folders.some((f) => folders.some((f2) => f2.path.startsWith(f.path)))
      )
        return dialogStore.showError(
          "You can't move a folder into its own subfolder.",
        );
      if (
        folders.some((f) =>
          folders.some((f2) => (f2.path + f2.name).startsWith(f.path + f.name)),
        )
      )
        return dialogStore.showError(
          "You can't move a folder and its subfolders at the same time.",
        );
      api.moveItems(newItems, path);
      // todo
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
    item.name = item.newName;
  };
  const clearRenaming = () => {
    const renaming = items.value.find((i) => i.isRenaming);
    if (renaming) renaming.isRenaming = false;
  };
  const selectAll = () => items.value.forEach((i) => (i.isSelected = true));
  const deselectAll = () => items.value.forEach((i) => (i.isSelected = false));

  return {
    items,
    selectedItems,
    newFolderName,
    isNameInvalid: isItemInvalid,
    handleDrop,
    createFolder,
    createFiles,
    deleteItems,
    selectAll,
    deselectAll,
    clearRenaming,
    renameItem,
  };
};

export const useItemsStore = defineStore("items", itemsStore);
export const useSearchItemsStore = defineStore("search-items", itemsStore);
export const useItemsManager = defineStore("items-manager", () => {
  const itemsStore = useItemsStore();
  const searchItemsStore = useSearchItemsStore();
  const searchStore = useSearchStore();
  const pathStore = usePathStore();

  const createItem = (item: Item) => {
    itemsStore.items.push(item);
    if (searchStore.itemPassesFilters(item)) searchItemsStore.items.push(item);
  };
  const createItems = (items: Item[], path: string) => {
    if (path == pathStore.currentPath) itemsStore.items.push(...items);
    searchItemsStore.items.push(...items.filter(searchStore.itemPassesFilters));
  };
  const deleteItems = (items: Item[]) => {
    itemsStore.items = itemsStore.items.filter((i) => !items.includes(i));
    searchItemsStore.items = searchItemsStore.items.filter(
      (i) => !items.includes(i),
    );
  };

  return {
    createItem,
    createItems,
    deleteItems,
  };
});
