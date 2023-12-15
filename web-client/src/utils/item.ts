export function _createFolder(name: string, path: string): ItemCore {
  return {
    name,
    type: "",
    dateAdded: new Date(),
    dateModified: new Date(),
    path,
    isFolder: true,
  };
}

export function convertFilesToItems(files: FileList, path: string): ItemCore[] {
  const newItems: ItemCore[] = [];
  for (const file of files) {
    if (!file.size) continue;
    const split = file.name.split(".");
    newItems.push({
      name: split.length > 1 ? split.slice(0, -1).join(".") : file.name,
      type: split.length > 1 ? split.at(-1)! : "",
      dateAdded: new Date(),
      dateModified: new Date(file.lastModified),
      path,
      isFolder: false,
      size: file.size,
    });
  }
  return newItems;
}

export function checkItem(item: Item, items: Item[]) {
  const alreadyExists = item.isFolder
    ? items.filter((i) => i.isFolder).some((i) => i.name == item.name)
    : items
        .filter((i) => !i.isFolder)
        .some((i) => i.name == item.name && i.type == item.type);
  const fullName = `${item.name}${item.type ? `.${item.type}` : ""}`;
  const hasInvalidChars = /[\\/:*?"<>|]/.test(fullName);
  const type = item.isFolder ? "folder" : "file";
  const error =
    item.isFolder && !item.name
      ? `A folder name can't be blank.`
      : alreadyExists
      ? `This destination already contains a ${type} named '${fullName}'.`
      : hasInvalidChars
      ? `A ${type} name can't contain any of the following characters: \\ / : * ? " < > |`
      : undefined;
  return { error };
}

export function getFullPath(item: Item) {
  return `${item.path ? `${item.path}/` : ""}${item.name}`;
}
