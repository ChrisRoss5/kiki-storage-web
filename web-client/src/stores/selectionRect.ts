import { defineStore } from "pinia";
import { ref } from "vue";
import { useItemsStore } from "@/stores/items";

export const useSelectionRectStore = defineStore("selectionRect", () => {
  const itemsStore = useItemsStore();

  let items = [] as { el: HTMLElement; item: Item }[];
  const rectEl = ref<HTMLElement | null>(null);
  let rectElBounding = null as DOMRect | null;
  let startCoords = { x: 0, y: 0 };
  let isLeftMouseDown = ref<boolean>(false);
  let isActive = ref<boolean>(false);
  let wasActive = ref<boolean>(false);
  let scrollDirection = ref<"up" | "down" | null>(null);
  let isCtrlOrShiftDown = false;

  const activate = () => {
    document.body.style.userSelect = "none";
    rectEl.value!.style.display = "";
    isActive.value = true;
    items = itemsStore.items.map((item) => {
      return { el: document.getElementById(item.id!.toString())!, item };
    });
    if (!isCtrlOrShiftDown) itemsStore.deselectAll();
  };
  const deactivate = () => {
    document.body.style.userSelect = "";
    rectEl.value!.style.display = "none";
    isActive.value = false;
    scrollDirection.value = null;
  };
  const handleMouseDown = (e: MouseEvent) => {
    isCtrlOrShiftDown = e.ctrlKey || e.shiftKey;
    let target = e.target as HTMLElement;
    target = target.closest("#explorer-container") as HTMLElement;
    rectElBounding = target.getBoundingClientRect();
    startCoords = { x: e.clientX, y: e.clientY };
    isLeftMouseDown.value = true;
  };
  let isThrottled = false;
  const handleMouseMove = (e: MouseEvent) => {
    if (!isLeftMouseDown.value) return;
    const _rectEl = rectEl.value!;
    const left = Math.min(startCoords.x, e.clientX);
    const top = Math.min(startCoords.y, e.clientY);
    const right = Math.max(startCoords.x, e.clientX);
    const bottom = Math.max(startCoords.y, e.clientY);
    const _left = Math.max(left, rectElBounding!.left);
    const _top = Math.max(top, rectElBounding!.top);
    const _right = Math.min(right, rectElBounding!.right);
    const _bottom = Math.min(bottom, rectElBounding!.bottom);
    const _width = _right - _left;
    const _height = _bottom - _top;
    if (!isActive.value && (_width < 5 || _height < 5)) return;
    if (!isActive.value) activate();
    _rectEl.style.width = `${_width}px`;
    _rectEl.style.height = `${_height}px`;
    _rectEl.style.left = `${_left}px`;
    _rectEl.style.top = `${_top}px`;
    if (rectElBounding!.top > top) scrollDirection.value = "up";
    else if (rectElBounding!.bottom < bottom) scrollDirection.value = "down";
    else scrollDirection.value = null;

    if (isThrottled) return;
    isThrottled = true;
    setTimeout(() => (isThrottled = false), 10);
    for (const { el, item } of items) {
      const rect = el.getBoundingClientRect();
      const isOverlapping = !(
        rect.right + 1 < _left ||
        rect.left - 1 > _right ||
        rect.bottom + 1 < _top ||
        rect.top - 1 > _bottom
      );
      if (isOverlapping) item.isSelected = true;
    }
  };
  const handleSelectionExit = () => {
    if (isActive.value) wasActive.value = true;
    isLeftMouseDown.value = false;
    deactivate();
  };

  return {
    items,
    rectEl,
    scrollDirection,
    handleMouseMove,
    handleMouseDown,
    handleSelectionExit,
    isLeftMouseDown,
    isActive,
    wasActive,
  };
});
