import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useContextMenuStore } from "./context-menu";
import { treeStoreDefs } from "./items/manager";

export const useSelectionRectStore = defineStore("selection-rect", () => {
  const contextMenuStore = useContextMenuStore();
  const isMouseDown = ref<boolean>(false);
  const isActive = ref<boolean>(false);
  const wasActive = ref<boolean>(false); // To prevent left-click event after selection end

  let items: { item: Item; el: HTMLAnchorElement }[] = [];
  let rectEl = null as HTMLElement | null;
  let explEl = null as HTMLElement | null;
  let explElRect = null as DOMRect | null;
  let scrollEl = null as HTMLElement | null;
  let scrollElRect = null as DOMRect | null;
  let startCoords = { x: 0, y: 0 };
  let left = 0; // left and width must be global because they are used in the interval
  let width = 0;
  let scale = 0; // scale is needed in case the explEl is transformed with css scale
  let startScrollTop = 0;
  let startMaxScrollTop = 0; // to prevent auto-scrolling down to infinity in the interval
  let isCtrlOrShiftDown = false;
  let lastScrollDirection = null as "up" | "down" | null;
  let isThrottled = false;
  let interval: NodeJS.Timeout | undefined;
  let scrollStrength = 0;
  let isFileTree = false;
  let fileTreeOffsetTopTotal = 0;

  watch(
    () => contextMenuStore.activeContextMenu,
    (val) => {
      if (val && isMouseDown.value) addEventSideEffects();
      else removeEventSideEffects();
    },
  );

  const activate = () => {
    addEventSideEffects();
    isActive.value = true;
    rectEl!.style.transition = "";
    rectEl!.style.opacity = "1";
    rectEl!.style.pointerEvents = "";
    if (isFileTree && !isCtrlOrShiftDown)
      for (const treeStoreDef of Object.values(treeStoreDefs))
        treeStoreDef().deselectAll();
  };
  const deactivate = () => {
    isMouseDown.value = false;
    if (!isActive.value) return;
    removeEventSideEffects();
    isActive.value = false;
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
  const handleMouseDown = (
    _explEl: HTMLElement | null,
    _rectEl: HTMLElement | null,
    _items: Item[],
    _isFileTree: boolean,
    e: MouseEvent | TouchEvent,
  ) => {
    if (!_explEl || !_rectEl) return;
    isCtrlOrShiftDown = e.ctrlKey || e.shiftKey;
    const children = [..._explEl.children] as HTMLAnchorElement[];
    items = _items
      .filter((i) => !(isCtrlOrShiftDown && i.isSelected))
      .map((i) => ({ item: i, el: children.find((_i) => _i.id == i.id)! }));
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
    const { x, y } = getEventCoords(e);
    startCoords = { x, y: y + startScrollTop };
    isMouseDown.value = true;
  };
  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isMouseDown.value) return;
    if (e instanceof TouchEvent && !contextMenuStore.activeContextMenu)
      return deactivate();
    /* if (isThrottled) return;  // Todo: evaluate if this is needed
    isThrottled = true;
    setTimeout(() => (isThrottled = false), 10); */
    let scrolledDown = scrollEl!.scrollTop;
    if (isFileTree) scrolledDown -= fileTreeOffsetTopTotal;
    const { clientY, x, y } = getEventCoords(e);
    const xDist = x - startCoords.x;
    const yDist = y - startCoords.y + scrolledDown;
    width = Math.abs(xDist);
    let height = Math.abs(yDist);
    if (!isActive.value) {
      if (width < 10 && height < 10) return;
      activate();
    }
    left = xDist < 0 ? startCoords.x - width : startCoords.x;
    let top = yDist < 0 ? startCoords.y - height : startCoords.y;
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
    let { top: scrollElTop, bottom: scrollElBottom } = scrollElRect!;
    if (isFileTree) scrollElBottom -= 50;
    let scrollDirection = null as "up" | "down" | null;
    if (clientY < scrollElTop) {
      scrollDirection = "up";
      scrollStrength = scrollElTop - clientY;
    }
    if (clientY > scrollElBottom) {
      scrollDirection = "down";
      scrollStrength = clientY - scrollElBottom;
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
    checkOverlap();
  };
  const handleMouseUp = (e: MouseEvent | TouchEvent) => {
    if (isActive.value && e instanceof MouseEvent && e.button === 0)
      wasActive.value = true;
    deactivate();
  };
  const getEventCoords = (e: MouseEvent | TouchEvent) => {
    const { clientX } = e instanceof MouseEvent ? e : e.touches[0];
    const { clientY } = e instanceof MouseEvent ? e : e.touches[0];
    const x = (clientX - explElRect!.left) / scale;
    const y = (clientY - scrollElRect!.top) / scale;
    return { clientX, clientY, x, y };
  };
  const addEventSideEffects = () => {
    document.documentElement.style.userSelect = "none"; // Desktop
    document.documentElement.style.overflow = "hidden"; // Mobile
  };
  const removeEventSideEffects = () => {
    document.documentElement.style.userSelect = "";
    document.documentElement.style.overflow = "";
  };

  return {
    deactivate,
    isActive,
    wasActive,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
  };
});
