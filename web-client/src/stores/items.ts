import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useItemsStore = defineStore("items", () => {
  const items = ref<Item[]>([]);
  const files = computed(() => items.value.filter((i) => !i.isFolder));
  const folders = computed(() => items.value.filter((i) => i.isFolder));

  function checkName(
    name: string,
    type: "file" | "folder",
    _items?: Item[]
  ): { isValid: boolean; message?: string } {
    _items ??= items.value;
    const exists =
      type === "file"
        ? _items.filter((i) => !i.isFolder).some((f) => f.name == name)
        : _items.filter((i) => i.isFolder).some((f) => f.name == name);
    const hasInvalidChars = /[\\/:*?"<>|]/.test(name);

    const message = exists
      ? `This destination already contains a ${type} named '${name}'.`
      : hasInvalidChars
      ? `A ${type} name can't contain any of the following characters: \\ / : * ? " < > |`
      : undefined;

    return { isValid: !message, message };
  }
  function selectAll() {
    items.value.forEach((i) => (i.isSelected = true));
  }
  function deselectAll() {
    items.value.forEach((i) => (i.isSelected = false));
  }
  function clearRenaming() {
    items.value.forEach((i) => (i.isRenaming = false));
  }

  document.addEventListener("click", () => {
    deselectAll();
    clearRenaming();
  });
  document.addEventListener("keydown", (e) => {
    const inEditable =
      document.activeElement?.tagName == "INPUT" ||
      document.activeElement?.tagName == "TEXTAREA" ||
      (document.activeElement as HTMLElement).isContentEditable;
    if (e.key == "a" && e.ctrlKey && !inEditable) {
      document.body.style.userSelect = "none";
      e.preventDefault();
      selectAll();
      clearRenaming();
      document.body.style.userSelect = "";
    }
  });

  return {
    items,
    files,
    folders,
    checkName,
    selectAll,
    deselectAll,
    clearRenaming,
  };
});
