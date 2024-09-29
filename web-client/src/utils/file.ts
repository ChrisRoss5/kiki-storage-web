export async function readDirectoryRecursively() {
  const directoryHandle = await window.showDirectoryPicker();
  console.log(directoryHandle);

  const result: Record<string, File[]> = {};

  async function traverseDirectory(
    handle: FileSystemDirectoryHandle,
    currentPath = "",
  ) {
    for await (const [name, entry] of handle.entries()) {
      const fullPath = currentPath ? `${currentPath}/${name}` : name;
      if (entry.kind === "directory") {
        result[fullPath] = [];
        await traverseDirectory(entry, fullPath);
      } else {
        const file = await entry.getFile();
        const parentDir = currentPath || "";
        if (!result[parentDir]) {
          result[parentDir] = [];
        }
        result[parentDir].push(file);
      }
    }
  }

  await traverseDirectory(directoryHandle, directoryHandle.name);
  return result;
}

export async function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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

  }
} */
