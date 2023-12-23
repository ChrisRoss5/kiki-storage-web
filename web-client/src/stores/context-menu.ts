import { defineStore } from "pinia";
import { ref } from "vue";
import { ItemStore } from "./items/manager";

type ContextMenu = "item" | "column" | "explorer";

export const useContextMenuStore = defineStore("context-menu", () => {
  const activeContextMenu = ref<ContextMenu | null>(null);
  const itemStore = ref<ItemStore>();
  const position = ref({ x: 0, y: 0 });

  const show = (menu: ContextMenu, _store: ItemStore, e: MouseEvent) => {
    activeContextMenu.value = menu;
    itemStore.value = _store;
    position.value = { x: e.clientX, y: e.clientY };
  };
  const hide = () => {
    activeContextMenu.value = null;
  };

  return {
    activeContextMenu,
    position,
    itemStore,
    show,
    hide,
  };
});
