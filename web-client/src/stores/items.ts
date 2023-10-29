import api from "@/scripts/api";
import * as utils from "@/scripts/utils";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useDialogStore } from "./dialog";
import { usePathStore } from "./path";

export const useItemsStore = defineStore("items", () => {
  const dialogStore = useDialogStore();
  const pathStore = usePathStore();

  const items = ref<Item[]>([]);

  const handleDrop = (e: DragEvent, path?: string) => {
    utils.clearDragOverStyle(e);
    if (e.dataTransfer) addFiles(e.dataTransfer.files, path);
  };
  const addFolder = async (name: string) => {
    const item = {
      name,
      dateAdded: new Date(),
      dateModified: new Date(),
      path: pathStore.currentPath,
      isFolder: true,
    };
    items.value.push(item);
    await api.createItem(item);
  };
  const addFiles = async (files: FileList, path?: string) => {
    path ??= pathStore.currentPath;
    const newItems = utils.convertFilesToItems(files, path);
    if (!newItems.length)
      return dialogStore.showError("No valid files were selected.");
    const scopedItems =
      path == pathStore.currentPath ? items.value : await api.getItems(path);
    if (newItems.some((i) => checkName(i.name, i.isFolder, scopedItems)))
      return;
    if (path == pathStore.currentPath) items.value.push(...newItems);
    await api.createItems(newItems);
  };
  const deleteItems = async (selectedItems: Item[]) => {
    const plural = selectedItems.length > 1;
    const toDelete = plural ? `${selectedItems.length} items` : "one item";
    const message = `Are you sure you want to delete ${toDelete}?`;
    if (!(await dialogStore.confirm(message))) return;
    items.value = items.value.filter((i) => !selectedItems.includes(i));
    api.deleteItems(selectedItems);
  };
  const checkName = (name: string, isFolder: boolean, _items?: Item[]) => {
    _items ??= items.value;
    const exists = isFolder
      ? _items.filter((i) => i.isFolder).some((f) => f.name == name)
      : _items.filter((i) => !i.isFolder).some((f) => f.name == name);
    const hasInvalidChars = /[\\/:*?"<>|]/.test(name);
    const type = isFolder ? "folder" : "file";
    const error = exists
      ? `This destination already contains a ${type} named '${name}'.`
      : hasInvalidChars
      ? `A ${type} name can't contain any of the following characters: \\ / : * ? " < > |`
      : undefined;
    if (error) dialogStore.showError(error);
    return error;
  };
  const selectAll = () => items.value.forEach((i) => (i.isSelected = true));
  const deselectAll = () => items.value.forEach((i) => (i.isSelected = false));
  const clearRenaming = () => {
    const renaming = items.value.find((i) => i.isRenaming);
    if (renaming) renaming.isRenaming = false;
  };
  const renameItem = async (item: Item, newName: string) => {
    if (checkName(newName, item.isFolder)) return;
    const oldName = item.name;
    item.isRenaming = false;
    item.name = newName;
    await api.renameItem(item, oldName, newName);
  };

  /* LISTENERS */

  document.addEventListener("click", () => {
    deselectAll();
    clearRenaming();
  });
  document.addEventListener("keydown", (e) => {
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
    handleDrop,
    addFolder,
    addFiles,
    deleteItems,
    checkName,
    selectAll,
    deselectAll,
    clearRenaming,
    renameItem,
  };
});
