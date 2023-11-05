let isThrottled = false;
export function setDragOverStyle(e: DragEvent) {
  if (isThrottled) return;
  isThrottled = true;
  setTimeout(() => (isThrottled = false), 10);
  let target = e.target as HTMLElement;
  target =
    target.closest("TR") ?? target.closest(".explorer-container") ?? target;
  const willNeedRect = target.tagName == "TR";
  if (willNeedRect && !target.classList.contains("folder"))
    target = target.closest(".explorer-container")!;
  if (
    document.body.hasAttribute("dragging-items") &&
    (target.classList.contains("explorer-container") ||
      target.classList.contains("router-link-active") ||
      target.classList.contains("is-selected"))
  )
    return;
  let { offsetX: x, offsetY: y } = e;
  if (willNeedRect) {
    const rect = target.getBoundingClientRect();
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }
  target.classList.add("dragover");
  target.style.background = `radial-gradient(
    circle at ${x}px ${y}px,
    hsl(var(--a) / 100%),
    hsl(var(--a) / 50%) 50%,
    hsl(var(--b1)) 70%
  ) no-repeat`;
}

export function clearDragOverStyle(e: DragEvent) {
  let target = e.target as HTMLElement;
  if (target.nodeType != 1) return;
  if (typeof target == "string") return;
  if (target.closest("TR:not(.folder)")) return;
  target =
    target.closest(".folder") ??
    target.closest(".explorer-container") ??
    target;
  target.classList.remove("dragover");
  target.style.background = "";
}
