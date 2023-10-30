export function createFolder(name: string, path: string) {
  return {
    name,
    dateAdded: new Date(),
    dateModified: new Date(),
    path,
    isFolder: true,
  };
}

export function checkName(name: string, isFolder: boolean, items: Item[]) {
  const alreadyExists = isFolder
    ? items.filter((i) => i.isFolder).some((f) => f.name == name)
    : items.filter((i) => !i.isFolder).some((f) => f.name == name);
  const hasInvalidChars = /[\\/:*?"<>|]/.test(name);
  const type = isFolder ? "folder" : "file";
  const error = alreadyExists
    ? `This destination already contains a ${type} named '${name}'.`
    : hasInvalidChars
    ? `A ${type} name can't contain any of the following characters: \\ / : * ? " < > |`
    : undefined;
  return { error };
}

export function convertFilesToItemFiles(files: FileList, path: string): Item[] {
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

export function itemsEqual(a: Item, b: Item): boolean {
  return a.name == b.name && a.path == b.path && a.isFolder == b.isFolder;
}

let isThrottled = false;
export function setDragOverStyle(e: DragEvent) {
  if (isThrottled) return;
  let target = e.target as HTMLElement;
  target =
    target.closest("TR") ?? target.closest("#explorer-container") ?? target;
  let { offsetX: x, offsetY: y } = e;
  if (target.tagName == "TR") {
    if (!target.classList.contains("folder"))
      target = target.closest("#explorer-container")!;
    const rect = target.getBoundingClientRect();
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }
  if (
    document.body.hasAttribute("dragging-items") &&
    (target.id == "explorer-container" ||
      target.classList.contains("router-link-active") ||
      target.classList.contains("is-selected"))
  )
    return;
  target.classList.add("dragover");
  target.style.background = `radial-gradient(
    circle at ${x}px ${y}px,
    hsl(var(--a) / 100%),
    hsl(var(--a) / 50%) 50%,
    hsl(var(--b1)) 70%
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
    target.closest(".folder") ??
    target.closest("#explorer-container") ??
    target;
  target.classList.remove("dragover");
  target.style.background = "";
}

/* EXPERIMENTAL; UNUSED; NON-STANDARD */

/* export async function getAllFileEntries(
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
} */
