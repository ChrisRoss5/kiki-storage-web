export function isFile(item: Folder | File): item is File {
  return "size" in item;
}

export function isFolder(item: Folder | File): item is Folder {
  return !isFile(item);
}

export function checkName(
  name: string,
  type: "file" | "folder",
  items: Item[]
): { isValid: boolean; message?: string } {
  let message = "";
  if (
    type == "file"
      ? items.filter(isFile).some((f) => f.name == name)
      : items.filter(isFolder).some((f) => f.name == name)
  )
    message = `This destination already contains a ${type} named '${name}'.`;
  else if (/[\\/:*?"<>|]/.test(name))
    message =
      `A ${type} name can't contain any of the following characters: ` +
      "\\ / : * ? \" < > |";
  return { isValid: !message, message };
}
