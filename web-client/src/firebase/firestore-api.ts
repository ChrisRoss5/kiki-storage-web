import {
  FirestoreDataConverter,
  QueryConstraint,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  UseCollectionOptions,
  useCollection,
  useCurrentUser,
  useFirestore,
} from "vuefire";

const user = useCurrentUser();
const db = useFirestore();
const dbPath = `app/drive/${user.value?.uid}`;

const api = {
  searchItems(filters: SearchFilters) {
    const constraints: QueryConstraint[] = [];
    if (filters.query) {
      constraints.push(
        where("name", ">=", filters.query),
        where("name", "<=", `${filters.query}\uf8ff`),
      );
    }
    if (filters.minSize) constraints.push(where("size", ">=", filters.minSize));
    if (filters.maxSize) constraints.push(where("size", "<=", filters.maxSize));
    if (filters.type) {
      if (filters.type == "Folders")
        constraints.push(where("isFolder", "==", true));
      else if (filters.type == "Files")
        constraints.push(where("isFolder", "==", false));
      else constraints.push(where("type", "in", filters.type));
    }
    return useCollection(
      query(collection(db, dbPath), ...constraints).withConverter(
        itemConverter,
      ),
      { ssrKey: filters.query }, // Vuefire Issue #1315 - suppress SSR console warning
    );
  },
  getItems(path: string, nestedOnly?: boolean, options?: UseCollectionOptions) {
    return useCollection(
      query(
        collection(db, dbPath),
        ...(nestedOnly
          ? [
              where("path", ">=", `${path}/`),
              where("path", "<=", `${path}/\uf8ff`),
            ]
          : [where("path", "==", path)]),
      ).withConverter(itemConverter),
      { ssrKey: path, ...options },
    );
  },
  createItem(item: Item) {
    addDoc(collection(db, dbPath).withConverter(itemConverter), item);
    updateDateModified(item.path);
  },
  createItems(items: Item[]) {
    for (const item of items)
      addDoc(collection(db, dbPath).withConverter(itemConverter), item);
    updateDateModified(items[0].path);
  },
  moveItems(items: Item[], newPath: string) {
    for (const item of items) {
      updateDoc(doc(db, dbPath, item.id!), { path: newPath });
      if (item.isFolder)
        updatePaths(
          `${item.path ? `${item.path}/` : ""}${item.name}`,
          `${newPath ? `${newPath}/` : ""}${item.name}`,
        );
    }
    updateDateModified(newPath);
  },
  renameItem(item: Item) {
    updateDoc(doc(db, dbPath, item.id!), { name: item.newName });
    if (item.isFolder)
      updatePaths(`${item.path}/${item.name}`, `${item.path}/${item.newName}`);
    updateDateModified(item.path);
  },
  deleteItems(items: Item[]) {
    for (const item of items) {
      deleteDoc(doc(db, dbPath, item.id!));
      if (item.isFolder)
        api.getItems(item.path, true).promise.value.then((items) => {
          for (const nestedItem of items)
            deleteDoc(doc(db, dbPath, nestedItem.id!));
        });
    }
  },
};

async function updatePaths(oldPath: string, newPath: string) {
  const items = await api.getItems(oldPath, true).promise.value;
  for (const nestedItem of items) {
    const regexp = new RegExp(`^${oldPath}`);
    updateDoc(doc(db, dbPath, nestedItem.id!), {
      path: nestedItem.path.replace(regexp, newPath),
    });
  }
}

/* async function updateDateModified(path: string) {
  if (!path) return;
  const name = path.split("/").pop()!;
  path = path.slice(0, -name.length - 1);
  const parentItem = await useCollection(
    query(
      collection(db, dbPath),
      where("path", "==", path),
      where("name", "==", name),
      limit(1),
    ).withConverter(itemConverter),
    { ssrKey: path },
  ).promise.value.then((items) => items[0]);
  updateDoc(doc(db, dbPath, parentItem.id!), { dateModified: Timestamp.now() });
} */

export interface DbItem {
  id?: string;
  name: string;
  type: string;
  dateAdded: Timestamp;
  dateModified: Timestamp;
  path: string;
  isFolder: boolean;
  size?: number;
}

const itemConverter: FirestoreDataConverter<ItemCore, DbItem> = {
  fromFirestore: (snapshot, options): ItemCore => {
    const data = snapshot.data(options) as DbItem;
    return {
      ...data,
      dateAdded: data.dateAdded.toDate(),
      dateModified: data.dateModified.toDate(),
    };
  },
  toFirestore: (i: Item): DbItem => {
    return {
      id: i.id,
      name: i.name,
      path: i.path,
      dateAdded: Timestamp.fromDate(i.dateAdded),
      dateModified: Timestamp.fromDate(i.dateModified),
      isFolder: i.isFolder,
      size: i.size,
      type: i.type,
    };
  },
};

export default api;
