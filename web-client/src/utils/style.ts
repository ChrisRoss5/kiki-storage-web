let isThrottled = false; // To prevent lag
let isDragoverOverExplBody = false; // To prevent flicker between items

export function setDragOverStyle(e: DragEvent) {
  if (isThrottled) return;
  isThrottled = true;
  setTimeout(() => (isThrottled = false), 10);
  let target = e.target as HTMLElement;
  target =
    target.closest(".expl-item") ?? target.closest(".expl-body") ?? target;
  const willNeedRect = target.classList.contains("expl-item");
  if (willNeedRect && !target.classList.contains("folder"))
    target = target.closest(".expl-body")!;
  if (
    (document.body.hasAttribute("dragging-items") &&
      ((target.classList.contains("expl-body") &&
        target.getAttribute("path") ==
          document.body.getAttribute("dragging-items")) ||
        target.classList.contains("is-current-path") ||
        target.classList.contains("is-selected"))) ||
    (target.classList.contains("expl-body") &&
      target.closest("#search-results"))
  )
    return;
  let { offsetX: x, offsetY: y } = e;
  if (willNeedRect) {
    const rect = target.getBoundingClientRect();
    const scale = rect.width / target.offsetWidth;
    x = (e.clientX - rect.left) / scale;
    y = (e.clientY - rect.top) / scale;
  }
  target.classList.add("dragover");
  if (target.classList.contains("expl-body")) {
    isDragoverOverExplBody = true;
    target.style.background = `radial-gradient(
    circle at ${x}px ${y}px,
    oklch(var(--a) / 100%) 5%,
    oklch(var(--a) / 50%) 10%,
    transparent 20%
  ) no-repeat`;
  } else {
    target.style.background = `radial-gradient(
    circle at ${x}px ${y}px,
    oklch(var(--a) / 100%),
    oklch(var(--a) / 50%) 50%,
    transparent 70%
  )`;
  }
}

export function clearDragOverStyle(e: DragEvent) {
  let target = e.target as HTMLElement;
  target = target.closest(".folder") ?? target.closest(".expl-body") ?? target;
  if (target.classList.contains("expl-body")) {
    isDragoverOverExplBody = false;
    setTimeout(() => {
      if (isDragoverOverExplBody) return;
      target.classList.remove("dragover");
      target.style.background = "";
    }, 100);
  } else {
    target.classList.remove("dragover");
    target.style.background = "";
  }
}
