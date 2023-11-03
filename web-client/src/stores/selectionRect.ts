import { useItemsStore } from "@/stores/items";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useSelectionRectStore = defineStore("selectionRect", () => {
  const itemsStore = useItemsStore();

  const rectEl = ref<HTMLElement | null>(null);
  const explEl = ref<HTMLElement | null>(null);
  const isLeftMouseDown = ref<boolean>(false);
  const isActive = ref<boolean>(false);
  const wasActive = ref<boolean>(false);

  let items = [] as { el: HTMLElement; item: Item }[];
  let explElRect = null as DOMRect | null;
  let startCoords = { x: 0, y: 0 };
  let startScrollTop = 0;
  let startScrollHeight = 0;
  let isCtrlOrShiftDown = false;
  let lastScrollDirection = null as "up" | "down" | null;
  let isThrottled = false;
  let interval: NodeJS.Timeout | undefined;
  let scrollStrength = 0;

  const activate = () => {
    document.body.style.userSelect = "none";
    isActive.value = true;
    rectEl.value!.style.transition = "";
    rectEl.value!.style.opacity = "1";
    rectEl.value!.style.pointerEvents = "";
    const rowEls = [...explEl.value!.querySelectorAll("tr")];
    items = itemsStore.items.flatMap((item) => {
      const el = rowEls.find((el) => el.id == item.id!.toString());
      if (!el) return [];  // Because this might be search explorer
      const wasSelected = isCtrlOrShiftDown && item.isSelected;
      return wasSelected ? [] : [{ el, item }];
    });
    if (!isCtrlOrShiftDown) itemsStore.deselectAll();
  };
  const deactivate = () => {
    if (!rectEl.value) return;
    document.body.style.userSelect = "";
    isActive.value = false;
    lastScrollDirection = null;
    rectEl.value!.style.transition = "opacity 0.2s";
    rectEl.value!.style.opacity = "0";
    rectEl.value!.style.pointerEvents = "none";
    clearInterval(interval);
  };
  const handleLeftMouseDown = (
    _explEl: HTMLElement,
    _rectEl: HTMLElement,
    e: MouseEvent
  ) => {
    explEl.value = _explEl;
    rectEl.value = _rectEl;
    explElRect = explEl.value!.getBoundingClientRect();
    startScrollTop = explEl.value!.scrollTop;
    startScrollHeight = explEl.value!.scrollHeight;
    startCoords = {
      x: e.clientX - explElRect.left,
      y: e.clientY - explElRect.top + startScrollTop,
    };
    isLeftMouseDown.value = true;
    isCtrlOrShiftDown = e.ctrlKey || e.shiftKey;
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!isLeftMouseDown.value) return;
    const scrolledDown = explEl.value!.scrollTop - startScrollTop;
    const newCoords = {
      x: e.clientX - explElRect!.left,
      y: e.clientY - explElRect!.top + startScrollTop + scrolledDown,
    };
    const x = newCoords.x - startCoords.x;
    const y = newCoords.y - startCoords.y;
    const width = Math.abs(x);
    let height = Math.abs(y);
    if (!isActive.value) {
      if (width < 5 || height < 5) return;
      activate();
    }
    const left = x < 0 ? startCoords.x - width : startCoords.x;
    let top = y < 0 ? startCoords.y - height : startCoords.y;
    rectEl.value!.style.top = `${top}px`;
    rectEl.value!.style.left = `${left}px`;
    rectEl.value!.style.width = `${width}px`;
    rectEl.value!.style.height = `${height}px`;
    const checkOverlap = () => {
      for (const { el, item } of items)
        item.isSelected = !(
          el.offsetLeft + el.offsetWidth <= left ||
          el.offsetLeft >= left + width ||
          el.offsetTop + el.offsetHeight <= top ||
          el.offsetTop >= top + height
        );
    };
    let scrollDirection = null as "up" | "down" | null;
    if (e.clientY < explElRect!.top) {
      scrollDirection = "up";
      scrollStrength = explElRect!.top - e.clientY;
    }
    if (e.clientY > explElRect!.bottom) {
      scrollDirection = "down";
      scrollStrength = e.clientY - explElRect!.bottom;
    }
    if (scrollDirection != lastScrollDirection) {
      lastScrollDirection = scrollDirection;
      clearInterval(interval);
      if (!scrollDirection) return;
      interval = setInterval(() => {
        const strength = Math.max(5, scrollStrength / 8);
        const pixels = scrollDirection == "up" ? -strength : strength;
        if (
          scrollDirection == "down" &&
          explEl.value!.scrollTop >=
            startScrollHeight - explEl.value!.offsetHeight
        )
          return clearInterval(interval);
        explEl.value!.scrollBy(0, pixels);
        if (scrollDirection == "up") top += pixels;
        height += Math.abs(pixels);
        rectEl.value!.style.top = `${top}px`;
        rectEl.value!.style.height = `${height}px`;
        checkOverlap();
      }, 10);
    }
    if (isThrottled) return;
    isThrottled = true;
    setTimeout(() => (isThrottled = false), 10);
    checkOverlap();
  };
  const handleLeftMouseUp = () => {
    if (isActive.value) wasActive.value = true;
    isLeftMouseDown.value = false;
    deactivate();
  };

  return {
    rectEl,
    explEl,
    handleMouseMove,
    handleLeftMouseDown,
    handleLeftMouseUp,
    isLeftMouseDown,
    isActive,
    wasActive,
  };
});
