import { roots } from "@/stores/settings/default";
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
import { defineStore } from "pinia";
import {
  UseCollectionOptions,
  useCollection,
  useCurrentUser,
  useFirestore,
} from "vuefire";

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

// Vuefire Issue #1315 - SSR console warning

export const useItemsFirestoreStore = defineStore("items-firestore", () => {
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
      if (filters.minSize)
        constraints.push(where("size", ">=", filters.minSize));
      if (filters.maxSize)
        constraints.push(where("size", "<=", filters.maxSize));
      if (filters.type) {
        if (filters.type == "Folders")
          constraints.push(where("isFolder", "==", true));
        else if (filters.type == "Files")
          constraints.push(where("isFolder", "==", false));
        else {
          const types = filters.type.split(",").map((t) => t.trim());
          constraints.push(where("type", "in", types));
        }
      }
      return useCollection(
        query(collection(db, dbPath), ...constraints).withConverter(
          itemConverter,
        ),
      );
    },
    getItems(
      path: string,
      nestedOnly?: boolean,
      options?: UseCollectionOptions,
    ) {
      return useCollection(
        query(
          collection(db, dbPath),
          ...(nestedOnly
            ? [
                where("path", ">=", `${path}`),
                where("path", "<=", `${path}\uf8ff`),
              ]
            : [where("path", "==", path)]),
        ).withConverter(itemConverter),
        { ...options },
      );
    },
    async getParentItem(path: string) {
      if (path in roots) return null;
      const name = path.split("/").pop()!;
      path = path.slice(0, -name.length - 1);
      const items = await useCollection(
        query(
          collection(db, dbPath),
          where("path", "==", path),
          where("name", "==", name),
          limit(1), // this costs one read no matter how many items match
        ).withConverter(itemConverter),
        { once: true },
      ).promise.value;
      return items.at(0) ?? null;
    },
    createItem(item: Item) {
      addDoc(collection(db, dbPath).withConverter(itemConverter), item);
      updateParentDateModified(item);
    },
    createItems(items: Item[]) {
      for (const item of items)
        addDoc(collection(db, dbPath).withConverter(itemConverter), item);
      updateParentDateModified(...items);
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
      updateParentDateModified(...items);
    },
    renameItem(item: Item) {
      updateDoc(doc(db, dbPath, item.id!), { name: item.newName });
      if (item.isFolder)
        updatePaths(
          `${item.path ? `${item.path}/` : ""}${item.name}`,
          `${item.path ? `${item.path}/` : ""}${item.newName}`,
        );
      updateParentDateModified(item);
    },
    deleteItems(items: Item[]) {
      for (const item of items) {
        deleteDoc(doc(db, dbPath, item.id!));
        if (item.isFolder)
          api
            .getItems(item.path + item.name, true)
            .promise.value.then((items) => {
              for (const nestedItem of items)
                deleteDoc(doc(db, dbPath, nestedItem.id!));
            });
      }
      updateParentDateModified(...items);
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

  async function updateParentDateModified(...items: Item[]) {
    for (let path of new Set(items.map((i) => i.path))) {
      const parent = await api.getParentItem(path);
      if (!parent) continue;
      const updateData = { dateModified: Timestamp.now() };
      updateDoc(doc(db, dbPath, parent.id!), updateData);
    }
  }

  const itemConverter: FirestoreDataConverter<ItemCore, DbItem> = {
    fromFirestore: (snapshot, options): ItemCore => {
      const data = snapshot.data(options) as DbItem;
      return {
        ...data,
        id: snapshot.id,
        dateAdded: data.dateAdded.toDate(),
        dateModified: data.dateModified.toDate(),
      };
    },
    toFirestore: (i: Item): DbItem => {
      return {
        name: i.name,
        type: i.type,
        dateAdded: Timestamp.fromDate(i.dateAdded),
        dateModified: Timestamp.fromDate(i.dateModified),
        path: i.path,
        isFolder: i.isFolder,
        ...(i.size ? { size: i.size } : {}),
      };
    },
  };

  return { api };
});
