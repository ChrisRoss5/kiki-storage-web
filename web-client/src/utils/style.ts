let isThrottled = false;
export function setDragOverStyle(e: DragEvent) {
  if (isThrottled) return;
  isThrottled = true;
  setTimeout(() => (isThrottled = false), 10);
  let target = e.target as HTMLElement;
  target =
    target.closest(".expl-row") ?? target.closest(".expl-body") ?? target;
  const willNeedRect = target.classList.contains("expl-row");
  if (willNeedRect && !target.classList.contains("folder"))
    target = target.closest(".expl-body")!;
  if (
    document.body.hasAttribute("dragging-items") &&
    (target.classList.contains("expl-body") ||
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
  if (target.closest(".expl-row:not(.folder)")) return;
  target =
    target.closest(".folder") ??
    target.closest(".expl-body") ??
    target;
  target.classList.remove("dragover");
  target.style.background = "";
}
