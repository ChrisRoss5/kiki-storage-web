import { defineStore } from "pinia";
import { ref } from "vue";
import { ItemStore } from "./items/manager";

type ContextMenu = "item" | "column" | "explorer";

export const useContextMenuStore = defineStore("context-menu", () => {
  const activeContextMenu = ref<ContextMenu | null>(null);
  const itemStore = ref<ItemStore>();
  const position = ref({ x: -1, y: -1 });

  // TS BUG: MouseEvent is actually PointerEvent
  const show = (menu: ContextMenu, _store: ItemStore, e: MouseEvent) => {
    activeContextMenu.value = menu;
    itemStore.value = _store;
    let { clientX: x, clientY: y } = e;
    position.value = { x, y };
    document.addEventListener("touchmove", followTouch);
  };
  const hide = () => {
    activeContextMenu.value = null;
    position.value = { x: -1, y: -1 };
    document.removeEventListener("touchmove", followTouch);
  };

  const followTouch = (e: TouchEvent) => {
    const { clientX: x, clientY: y } = e.touches[0];
    position.value = { x, y };
  };

  return {
    activeContextMenu,
    position,
    itemStore,
    show,
    hide,
  };
});
