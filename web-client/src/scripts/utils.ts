import { Ref } from "vue";

export function checkName(
  name: string,
  type: "file" | "folder",
  items: Item[]
): { isValid: boolean; message?: string } {
  let message = "";
  if (
    type == "file"
      ? items.filter((i) => !i.isFolder).some((f) => f.name == name)
      : items.filter((i) => i.isFolder).some((f) => f.name == name)
  )
    message = `This destination already contains a ${type} named '${name}'.`;
  else if (/[\\/:*?"<>|]/.test(name))
    message =
      `A ${type} name can't contain any of the following characters: ` +
      '\\ / : * ? " < > |';
  return { isValid: !message, message };
}

export function convertFilesToItems(files: FileList, path: string): Item[] {
  const newItems: Item[] = [];
  for (const file of files) {
    if (!file.size) continue;
    newItems.push({
      name: file.name,
      dateAdded: new Date(),
      dateModified: new Date(file.lastModified),
      path,
      isFolder: false,
      size: file.size,
    });
  }
  return newItems;
}

let isThrottled = false;
export function setDragOverStyle(e: DragEvent) {
  if (isThrottled) return;
  let target = e.target as HTMLElement;
  target =
    target.closest("TR") || target.closest("#explorer-container") || target;
  let { offsetX: x, offsetY: y } = e;
  if (target.tagName == "TR") {
    if (!target.classList.contains("folder"))
      target = target.closest("#explorer-container")!;
    const rect = target.getBoundingClientRect();
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }
  target.classList.add("dragover");
  target.style.background = `radial-gradient(
    circle at ${x}px ${y}px,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 70%
  ) no-repeat`;
  isThrottled = true;
  setTimeout(() => (isThrottled = false), 10);
}

export function clearDragOverStyle(e: DragEvent) {
  let target = e.target as HTMLElement;
  if (target.nodeType != 1) return;
  if (typeof target == "string") return;
  if (target.closest("TR:not(.folder)")) return;
  target =
    target.closest(".folder") ||
    target.closest("#explorer-container") ||
    target;
  target.classList.remove("dragover");
  target.style.background = "";
}

export function initClickListener(items: Ref<Item[]>) {
  document.addEventListener("click", () => {
    deselectAll(items.value);
    clearRenaming(items.value);
  });
}

export function initSelectAllListener(items: Ref<Item[]>) {
  document.addEventListener("keydown", (e) => {
    if (
      e.key == "a" &&
      e.ctrlKey &&
      !(
        document.activeElement?.tagName == "INPUT" ||
        document.activeElement?.tagName == "TEXTAREA" ||
        (document.activeElement as HTMLElement).isContentEditable
      )
    ) {
      document.body.style.userSelect = "none";
      e.preventDefault();
      selectAll(items.value);
      clearRenaming(items.value);
      document.body.style.userSelect = "";
    }
  });
}

export function selectAll(items: Item[]) {
  items.forEach((i) => (i.isSelected = true));
}

export function deselectAll(items: Item[]) {
  items.forEach((i) => (i.isSelected = false));
}

export function clearRenaming(items: Item[]) {
  items.forEach((i) => (i.isRenaming = false));
}

/* EXPERIMENTAL; UNUSED; NON-STANDARD */

export async function getAllFileEntries(
  dataTransferItemList: DataTransferItemList
) {
  const fileEntries = [];
  const queue = [...dataTransferItemList].map((item) =>
    item.webkitGetAsEntry()
  );
  while (queue.length > 0) {
    const entry = queue.shift()!;
    if (entry.isFile) {
      fileEntries.push(entry);
    } else if (entry.isDirectory) {
      const reader = (entry as any).createReader();
      queue.push(...(await readAllDirectoryEntries(reader)));
    }
  }
  return fileEntries;
}

async function readAllDirectoryEntries(directoryReader: any) {
  const entries = [];
  let readEntries = (await readEntriesPromise(directoryReader)) as any;
  while (readEntries.length > 0) {
    entries.push(...readEntries);
    readEntries = await readEntriesPromise(directoryReader);
  }
  return entries;
}

async function readEntriesPromise(directoryReader: any) {
  try {
    return await new Promise((resolve, reject) => {
      directoryReader.readEntries(resolve, reject);
    });
  } catch (err) {
    // console.log(err);
  }
}
