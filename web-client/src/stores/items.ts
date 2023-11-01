import api from "@/scripts/api";
import * as utils from "@/scripts/utils";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useDialogStore } from "./dialog";
import { usePathStore } from "./path";

export const useItemsStore = defineStore("items", () => {
  const dialogStore = useDialogStore();
  const pathStore = usePathStore();

  const items = ref<Item[]>([]);
  const selectedItems = computed(() => items.value.filter((i) => i.isSelected));

  const areItemsInvalid = async (newItems: Item[], path: string) => {
    const scopedItems =
      path == pathStore.currentPath ? items.value : await api.getItems(path);
    return newItems.some((i) => isNameInvalid(i.name, i.isFolder, scopedItems));
  };
  const isNameInvalid = (name: string, isFolder: boolean, _items?: Item[]) => {
    const { error } = utils.checkName(name, isFolder, _items ?? items.value);
    if (error) dialogStore.showError(error);
    return !!error;
  };
  const handleDrop = async (e: DragEvent, path?: string) => {
    path ??= pathStore.currentPath;
    utils.clearDragOverStyle(e);
    const itemsData = e.dataTransfer?.getData("items");
    if (itemsData) {
      if (path == pathStore.currentPath) return;
      const newItems = JSON.parse(itemsData) as Item[];
      if ((await areItemsInvalid(newItems, path))) return;
      api.moveItems(newItems, path);
      items.value = items.value.filter((a) =>
        newItems.every((b) => !utils.itemsEqual(a, b))
      ); // todo - realtime update instead
    } else if (e.dataTransfer) addFiles(e.dataTransfer.files, path);
  };
  const addFolder = (name: string) => {
    const item = utils.createFolder(name, pathStore.currentPath);
    items.value.push(item);
    api.createItem(item);
  };
  const addFiles = async (files: FileList, path?: string) => {
    path ??= pathStore.currentPath;
    const newItems = utils.convertFilesToItemFiles(files, path);
    if (!newItems.length)
      return dialogStore.showError("No valid files were selected.");
    if ((await areItemsInvalid(newItems, path))) return;
    if (path == pathStore.currentPath) items.value.push(...newItems);
    api.createItems(newItems);
  };
  const deleteItems = async (selectedItems: Item[]) => {
    const plural = selectedItems.length > 1;
    const toDelete = plural ? `${selectedItems.length} items` : "one item";
    const message = `Are you sure you want to delete ${toDelete}?`;
    if (!(await dialogStore.confirm(message))) return;
    items.value = items.value.filter((i) => !selectedItems.includes(i));
    api.deleteItems(selectedItems);
  };
  const selectAll = () => items.value.forEach((i) => (i.isSelected = true));
  const deselectAll = () => items.value.forEach((i) => (i.isSelected = false));
  const clearRenaming = () => {
    const renaming = items.value.find((i) => i.isRenaming);
    if (renaming) renaming.isRenaming = false;
  };
  const renameItem = (item: Item, newName: string) => {
    if (item.name == newName) {
      item.isRenaming = false;
      return;
    }
    if (isNameInvalid(newName, item.isFolder)) return;
    const oldName = item.name;
    item.isRenaming = false;
    item.name = newName;
    api.renameItem({ ...item, name: oldName }, newName);
  };

  /* LISTENERS */

  document.addEventListener("click", () => {
    deselectAll();
    clearRenaming();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key == "Delete" && selectedItems.value.length)
      deleteItems(selectedItems.value);
    if (e.key == "F2" && selectedItems.value.length == 1) {
      e.preventDefault();
      selectedItems.value[0].isRenaming = true;
    }
    const inEditable =
      document.activeElement?.tagName == "INPUT" ||
      document.activeElement?.tagName == "TEXTAREA" ||
      (document.activeElement as HTMLElement).isContentEditable;
    if (e.key != "a" || !e.ctrlKey || inEditable) return;
    document.body.style.userSelect = "none";
    e.preventDefault();
    selectAll();
    clearRenaming();
    document.body.style.userSelect = "";
  });

  return {
    items,
    isNameInvalid,
    selectedItems,
    handleDrop,
    addFolder,
    addFiles,
    deleteItems,
    selectAll,
    deselectAll,
    clearRenaming,
    renameItem,
  };
});
