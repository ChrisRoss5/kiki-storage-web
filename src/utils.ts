export function isFile(item: Folder | File): item is File {
  return "size" in item;
}

export function isFolder(item: Folder | File): item is Folder {
  return !isFile(item);
}

export function isDuplicateName(
  name: string,
  type: "file" | "folder",
  items: Item[]
): boolean {
  return type == "file"
    ? items.filter(isFile).some((f) => f.name === name)
    : items.filter(isFolder).some((f) => f.name === name);
}
