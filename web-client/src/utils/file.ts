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
