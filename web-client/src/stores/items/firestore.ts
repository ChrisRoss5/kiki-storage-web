import { roots } from "@/stores/settings/default";
import {
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  QueryConstraint,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  query,
  setDoc,
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
import { useItemsStorageStore } from "./storage";

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
  const { api: storageApi } = useItemsStorageStore();
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
    createItem(
      item: Item,
      itemDoc?: DocumentReference<DocumentData, DocumentData>,
    ) {
      if (itemDoc) setDoc(itemDoc, item);
      else addDoc(collection(db, dbPath).withConverter(itemConverter), item);
      updateParentDateModified(item);
    },
    createItemDoc() {
      return doc(collection(db, dbPath).withConverter(itemConverter));
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
        this.deleteItem(item);
        if (item.isFolder)
          api
            .getItems(item.path + item.name, true, { once: true })
            .promise.value.then((items) => {
              items.forEach(this.deleteItem);
            });
      }
      updateParentDateModified(...items);
    },
    deleteItem(item: Item) {
      if (!item.isFolder) storageApi.deleteFile(item);
      deleteDoc(doc(db, dbPath, item.id!));
    },
  };

  async function updatePaths(oldPath: string, newPath: string) {
    const items = await api.getItems(oldPath, true, { once: true }).promise
      .value;
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
