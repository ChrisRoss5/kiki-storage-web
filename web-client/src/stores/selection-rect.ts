import { defineStore } from "pinia";
import { ref } from "vue";

export const useSelectionRectStore = defineStore("selection-rect", () => {
  const rectEl = ref<HTMLElement | null>(null);
  const explEl = ref<HTMLElement | null>(null);
  const isLeftMouseDown = ref<boolean>(false);
  const isActive = ref<boolean>(false);
  const wasActive = ref<boolean>(false);

  let items = [] as Item[];
  let isSearch = false;
  let explElRect = null as DOMRect | null;
  let startCoords = { x: 0, y: 0 };
  let left = 0; // left and width must be global because they are used in the interval
  let width = 0;
  let startScrollTop = 0;
  let startMaxScrollTop = 0; // to prevent auto-scrolling down to infinity in the interval
  let isCtrlOrShiftDown = false;
  let lastScrollDirection = null as "up" | "down" | null;
  let isThrottled = false;
  let interval: NodeJS.Timeout | undefined;
  let scrollStrength = 0;

  const activate = () => {
    isActive.value = true;
    document.body.style.userSelect = "none";
    rectEl.value!.style.transition = "";
    rectEl.value!.style.opacity = "1";
    rectEl.value!.style.pointerEvents = "";
  };
  const deactivate = () => {
    if (!rectEl.value) return;
    isActive.value = false;
    document.body.style.userSelect = "";
    lastScrollDirection = null;
    rectEl.value.style.transition = "opacity 300ms";
    rectEl.value.style.opacity = "0";
    rectEl.value.style.pointerEvents = "none";
    setTimeout(() => {
      if (!isActive.value)
        rectEl.value!.style.width = rectEl.value!.style.height = "0";
    }, 300);
    clearInterval(interval);
  };
  const handleLeftMouseDown = (
    _explEl: HTMLElement | null,
    _rectEl: HTMLElement | null,
    _items: Item[],
    _isSearch: boolean,
    e: MouseEvent,
  ) => {
    if (!_explEl || !_rectEl) return;
    isCtrlOrShiftDown = e.ctrlKey || e.shiftKey;
    items = _items.filter((i) => !(isCtrlOrShiftDown && i.isSelected));
    explEl.value = _explEl;
    rectEl.value = _rectEl;
    isSearch = _isSearch;
    explElRect = _explEl.getBoundingClientRect();
    startScrollTop = _explEl.scrollTop;
    startMaxScrollTop = _explEl.scrollHeight - _explEl.offsetHeight;
    startCoords = {
      x: e.clientX - explElRect.left,
      y: e.clientY - explElRect.top + startScrollTop,
    };
    isLeftMouseDown.value = true;
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
    width = Math.abs(x);
    let height = Math.abs(y);
    if (!isActive.value) {
      if (width < 5 || height < 5) return;
      activate();
    }
    left = x < 0 ? startCoords.x - width : startCoords.x;
    let top = y < 0 ? startCoords.y - height : startCoords.y;
    rectEl.value!.style.top = `${top}px`;
    rectEl.value!.style.left = `${left}px`;
    rectEl.value!.style.width = `${width}px`;
    rectEl.value!.style.height = `${height}px`;
    const checkOverlap = () => {
      for (const item of items) {
        const el = isSearch ? item.searchEl : item.el;
        if (!el) continue;
        item.isSelected = !(
          el.offsetLeft + el.offsetWidth <= left ||
          el.offsetLeft >= left + width ||
          el.offsetTop + el.offsetHeight <= top ||
          el.offsetTop >= top + height
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
        if (
          scrollDirection == "down" &&
          explEl.value!.scrollTop + pixels >= startMaxScrollTop
        )
          return clearInterval(interval);
        explEl.value!.scrollBy(0, pixels);
        if (top >= startCoords.y) {
          height += pixels;
          if (scrollDirection == "up" && height < 0) top = startCoords.y - 1;
        } else {
          top += pixels;
          height -= pixels;
        }
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
