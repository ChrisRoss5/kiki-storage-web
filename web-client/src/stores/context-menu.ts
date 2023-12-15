import { defineStore } from "pinia";
import { ref } from "vue";
import { ItemsStore } from "./items";

type ContextMenu = "item" | "column" | "explorer";

export const useContextMenuStore = defineStore("context-menu", () => {
  const activeContextMenu = ref<ContextMenu | null>(null);
  const itemsStore = ref<ItemsStore>();
  const position = ref({ x: 0, y: 0 });

  const show = (menu: ContextMenu, _store: ItemsStore, e: MouseEvent) => {
    activeContextMenu.value = menu;
    itemsStore.value = _store;
    position.value = { x: e.clientX, y: e.clientY };
  };
  const hide = () => {
    activeContextMenu.value = null;
  };

  return {
    activeContextMenu,
    position,
    itemsStore,
    show,
    hide,
  };
});
