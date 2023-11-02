import { useItemsStore } from "@/stores/items";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useSelectionRectStore = defineStore("selectionRect", () => {
  const itemsStore = useItemsStore();

  const rectEl = ref<HTMLElement | null>(null);
  const explEl = ref<HTMLElement | null>(null);
  let isLeftMouseDown = ref<boolean>(false);
  let isActive = ref<boolean>(false);
  let wasActive = ref<boolean>(false);

  let items = [] as { el: HTMLElement; item: Item; wasSelected: boolean }[];
  let explElRect = null as DOMRect | null;
  let startCoords = { x: 0, y: 0 };
  let startScrollTop = 0;
  let isCtrlOrShiftDown = false;
  let lastScrollDirection = null as "up" | "down" | null;
  let isThrottled = false;
  let interval: NodeJS.Timeout | undefined;

  const activate = () => {
    document.body.style.userSelect = "none";
    rectEl.value!.style.display = "";
    isActive.value = true;
    items = itemsStore.items.map((item) => {
      const el = document.getElementById(item.id!.toString())!;
      const wasSelected = (isCtrlOrShiftDown && item.isSelected) || false;
      return { el, item, wasSelected };
    });
    if (!isCtrlOrShiftDown) itemsStore.deselectAll();
  };
  const deactivate = () => {
    document.body.style.userSelect = "";
    rectEl.value!.style.display = "none";
    isActive.value = false;
    clearInterval(interval);
    lastScrollDirection = null;
  };
  const handleLeftMouseDown = (e: MouseEvent) => {
    if (!rectEl.value) return;
    isCtrlOrShiftDown = e.ctrlKey || e.shiftKey;
    explElRect = explEl.value!.getBoundingClientRect();
    startScrollTop = explEl.value!.scrollTop;
    startCoords = {
      x: e.clientX - explElRect.left,
      y: e.clientY - explElRect.top + startScrollTop,
    };
    isLeftMouseDown.value = true;
  };
  let scrollStrength = 0;

  const handleMouseMove = (e: MouseEvent) => {
    if (!rectEl.value || !isLeftMouseDown.value) return;
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
    rectEl.value!.style.display = "block";
    rectEl.value!.style.top = `${top}px`;
    rectEl.value!.style.left = `${left}px`;
    rectEl.value!.style.width = `${width}px`;
    rectEl.value!.style.height = `${height}px`;

    const checkOverlap = () => {
      for (const { el, item, wasSelected } of items) {
        if (wasSelected) continue;
        item.isSelected = !(
          el.offsetLeft + el.offsetWidth + 1 < left ||
          el.offsetLeft - 1 > left + width ||
          el.offsetTop + el.offsetHeight + 1 < top ||
          el.offsetTop - 1 > top + height
        );
      }
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
        explEl.value!.scrollBy(0, pixels);
        const scrolledDown = explEl.value!.scrollTop - startScrollTop + pixels;
        const newY =
          e.clientY - explElRect!.top + startScrollTop + scrolledDown;
        height = Math.abs(newY - startCoords.y);
        top = y < 0 ? startCoords.y - height : startCoords.y;
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
    if (!rectEl.value) return;
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
