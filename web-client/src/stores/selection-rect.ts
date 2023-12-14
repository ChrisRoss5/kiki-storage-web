import { defineStore } from "pinia";
import { ref } from "vue";

export const useSelectionRectStore = defineStore("selection-rect", () => {
  const isLeftMouseDown = ref<boolean>(false);
  const isActive = ref<boolean>(false);
  const wasActive = ref<boolean>(false);

  let items: { item: Item; el: HTMLAnchorElement }[] = [];
  let rectEl = null as HTMLElement | null;
  let explEl = null as HTMLElement | null;
  let explElRect = null as DOMRect | null;
  let scrollEl = null as HTMLElement | null;
  let scrollElRect = null as DOMRect | null;
  let startCoords = { x: 0, y: 0 };
  let left = 0; // left and width must be global because they are used in the interval
  let width = 0;
  let scale = 0; // scale is needed in case the explEl is transformed with scale
  let startScrollTop = 0;
  let startMaxScrollTop = 0; // to prevent auto-scrolling down to infinity in the interval
  let isCtrlOrShiftDown = false;
  let lastScrollDirection = null as "up" | "down" | null;
  let isThrottled = false;
  let interval: NodeJS.Timeout | undefined;
  let scrollStrength = 0;
  let isFileTree = false;
  let fileTreeOffsetTopTotal = 0;

  const activate = () => {
    isActive.value = true;
    document.body.style.userSelect = "none";
    rectEl!.style.transition = "";
    rectEl!.style.opacity = "1";
    rectEl!.style.pointerEvents = "";
  };
  const deactivate = () => {
    if (!isActive.value) return;
    isActive.value = false;
    document.body.style.userSelect = "";
    lastScrollDirection = null;
    rectEl!.style.transition = "opacity 300ms";
    rectEl!.style.opacity = "0";
    rectEl!.style.pointerEvents = "none";
    setTimeout(() => {
      if (isActive.value) return;
      rectEl!.style.top = rectEl!.style.left = "0";
      rectEl!.style.width = rectEl!.style.height = "0";
    }, 300);
    clearInterval(interval);
  };
  const handleLeftMouseDown = (
    _explEl: HTMLElement | null,
    _rectEl: HTMLElement | null,
    _items: Item[],
    _isFileTree: boolean,
    e: MouseEvent,
  ) => {
    if (!_explEl || !_rectEl) return;
    isCtrlOrShiftDown = e.ctrlKey || e.shiftKey;
    items = _items
      .filter((i) => !(isCtrlOrShiftDown && i.isSelected))
      .map((i) => ({
        item: i,
        el: [..._explEl.children].find(
          (_i) => _i.id == i.id,
        ) as HTMLAnchorElement,
      }));
    rectEl = _rectEl;
    explEl = _explEl;
    isFileTree = _isFileTree;
    explElRect = explEl.getBoundingClientRect();
    scrollEl = isFileTree ? explEl.closest("#filetree")! : explEl;
    scrollElRect = isFileTree ? scrollEl.getBoundingClientRect() : explElRect;
    scale = explElRect.width / explEl.offsetWidth;
    startScrollTop = scrollEl.scrollTop;
    if (isFileTree) {
      fileTreeOffsetTopTotal = 0;
      let el = explEl;
      while (el.id != "filetree") {
        fileTreeOffsetTopTotal += el.offsetTop;
        el = el.offsetParent as HTMLElement;
      }
      startScrollTop -= fileTreeOffsetTopTotal;
    }
    startMaxScrollTop = isFileTree
      ? explEl.offsetHeight - scrollEl.offsetHeight + fileTreeOffsetTopTotal
      : scrollEl.scrollHeight - scrollEl.offsetHeight;
    startCoords = {
      x: (e.clientX - explElRect.left) / scale,
      y: (e.clientY - scrollElRect.top) / scale + startScrollTop,
    };
    isLeftMouseDown.value = true;
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!isLeftMouseDown.value) return;
    let scrolledDown = scrollEl!.scrollTop;
    if (isFileTree) scrolledDown -= fileTreeOffsetTopTotal;
    const newCoords = {
      x: (e.clientX - explElRect!.left) / scale,
      y: (e.clientY - scrollElRect!.top) / scale + scrolledDown,
    };
    const x = newCoords.x - startCoords.x;
    const y = newCoords.y - startCoords.y;
    width = Math.abs(x);
    let height = Math.abs(y);
    if (!isActive.value) {
      if (width < 5 && height < 5) return;
      activate();
    }
    left = x < 0 ? startCoords.x - width : startCoords.x;
    let top = y < 0 ? startCoords.y - height : startCoords.y;
    rectEl!.style.top = `${top}px`;
    rectEl!.style.left = `${left}px`;
    rectEl!.style.width = `${width}px`;
    rectEl!.style.height = `${height}px`;
    const checkOverlap = () => {
      for (const { item, el } of items)
        item.isSelected = !(
          el.offsetLeft + el.offsetWidth <= left ||
          el.offsetLeft >= left + width ||
          el.offsetTop + el.offsetHeight <= top ||
          el.offsetTop >= top + height
        );
    };
    let scrollDirection = null as "up" | "down" | null;
    if (e.clientY < scrollElRect!.top) {
      scrollDirection = "up";
      scrollStrength = scrollElRect!.top - e.clientY;
    }
    if (e.clientY > scrollElRect!.bottom) {
      scrollDirection = "down";
      scrollStrength = e.clientY - scrollElRect!.bottom;
    }
    if (scrollDirection != lastScrollDirection) {
      lastScrollDirection = scrollDirection;
      clearInterval(interval);
      if (!scrollDirection) return;
      interval = setInterval(() => {
        const strength = Math.max(4, scrollStrength / 4);
        const pixels = scrollDirection == "up" ? -strength : strength;
        if (
          scrollDirection == "down" &&
          scrollEl!.scrollTop + pixels >= startMaxScrollTop
        ) {
          scrollEl!.scrollTop = startMaxScrollTop;
          return clearInterval(interval);
        }
        scrollEl!.scrollBy(0, pixels);
        if (top >= startCoords.y) {
          height += pixels;
          if (scrollDirection == "up" && height < 0) top = startCoords.y - 1;
        } else {
          top += pixels;
          height -= pixels;
        }
        rectEl!.style.top = `${top}px`;
        rectEl!.style.height = `${height}px`;
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
    isLeftMouseDown,
    isActive,
    wasActive,
    handleMouseMove,
    handleLeftMouseDown,
    handleLeftMouseUp,
  };
});
