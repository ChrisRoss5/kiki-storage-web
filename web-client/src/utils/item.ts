import { DbItem } from "@/stores/items/firebase/firestore";
import { FirestoreDataConverter, Timestamp } from "firebase/firestore";

export function createFolder(name: string, path: string): ItemCore {
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

export const firestoreItemConverter: FirestoreDataConverter<ItemCore, DbItem> =
  {
    fromFirestore: (snapshot, options): ItemCore => {
      const data = snapshot.data(options) as DbItem;
      return {
        ...data,
        id: snapshot.id,
        dateAdded: data.dateAdded.toDate(),
        dateModified: data.dateModified.toDate(),
      };
    },
    toFirestore: (i: Item) => {
      const dbItem: DbItem = {
        name: i.name,
        type: i.type,
        dateAdded: Timestamp.fromDate(i.dateAdded),
        dateModified: Timestamp.fromDate(i.dateModified),
        path: i.path,
      };
      if (i.isFolder) dbItem.isFolder = true;
      if (i.isFavorite) dbItem.isFavorite = true;
      if (i.size) dbItem.size = i.size;
      return dbItem;
    },
  };
