import { roots } from "@/stores/settings/default";
import { firestoreItemConverter, getFullPath } from "@/utils/item";
import {
  DocumentData,
  DocumentReference,
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
import { computed } from "vue";
import {
  UseCollectionOptions,
  _RefFirestore,
  useCollection,
  useCurrentUser,
  useFirestore,
} from "vuefire";
import { useCleanup } from "./cleanup";
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
  const cleanup = useCleanup();
  const { api: storageApi } = useItemsStorageStore();
  const dbPath = computed(() => `app/drive/${user.value?.uid}`);
  const pathItemCollections: Record<string, _RefFirestore<ItemCore[]>> = {};

  const $reset = () => {
    for (const path in pathItemCollections) {
      pathItemCollections[path].stop();
      delete pathItemCollections[path];
    }
  };

  const api = {
    searchItems(filters: SearchFilters) {
      const constraints: QueryConstraint[] = [];
      // Cannot have inequality filters on multiple properties!
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
        query(collection(db, dbPath.value), ...constraints).withConverter(
          firestoreItemConverter,
        ),
      );
    },
    getItems(
      path: string,
      nestedOnly?: boolean,
      options?: UseCollectionOptions,
    ) {
      if (path in pathItemCollections && !nestedOnly)
        return pathItemCollections[path];
      const coll = useCollection(
        query(
          collection(db, dbPath.value),
          ...(nestedOnly
            ? startsWithConstraints(path)
            : [where("path", "==", path)]),
        ).withConverter(firestoreItemConverter),
        { ...options },
      );
      if (!nestedOnly && !options) pathItemCollections[path] = coll;
      return coll;
    },
    async getParentItem(path: string) {
      if (path in roots) return null;
      const name = path.split("/").pop()!;
      path = path.slice(0, -name.length - 1);
      const items = await useCollection(
        query(
          collection(db, dbPath.value),
          where("path", "==", path),
          where("name", "==", name),
          limit(1), // this costs one read no matter how many items match
        ).withConverter(firestoreItemConverter),
        { once: true },
      ).promise.value;
      return items.at(0) ?? null;
    },
    createItem(
      item: Item,
      itemDoc?: DocumentReference<DocumentData, DocumentData>,
    ) {
      if (itemDoc) setDoc(itemDoc, item);
      else
        addDoc(
          collection(db, dbPath.value).withConverter(firestoreItemConverter),
          item,
        );
      updateParentDateModified(item);
    },
    createItemDoc() {
      return doc(
        collection(db, dbPath.value).withConverter(firestoreItemConverter),
      );
    },
    moveItems(items: Item[], newPath: string) {
      cleanup.onDelete(items);
      for (const item of items) {
        updateDoc(doc(db, dbPath.value, item.id!), { path: newPath });
        if (item.isFolder)
          updatePaths(
            `${getFullPath(item)}`,
            `${newPath ? `${newPath}/` : ""}${item.name}`,
          );
      }
      updateParentDateModified(...items);
    },
    renameItem(item: Item) {
      cleanup.onDelete([item]);
      updateDoc(doc(db, dbPath.value, item.id!), { name: item.newName });
      if (item.isFolder)
        updatePaths(
          `${getFullPath(item)}`,
          `${item.path ? `${item.path}/` : ""}${item.newName}`,
        );
      updateParentDateModified(item);
    },
    deleteItemsPermanently(items: Item[]) {
      cleanup.onDelete(items);
      for (const item of items) {
        this.deleteItemPermanently(item);
        if (item.isFolder)
          api
            .getItems(`${getFullPath(item)}`, true, {
              once: true,
            })
            .promise.value.then((items) => {
              items.forEach(this.deleteItemPermanently);
            });
      }
      updateParentDateModified(...items);
    },
    deleteItemPermanently(item: Item) {
      if (!item.isFolder) storageApi.deleteFile(item);
      deleteDoc(doc(db, dbPath.value, item.id!));
    },
  };

  function startsWithConstraints(string: string) {
    return [
      where("path", ">=", `${string}`),
      where("path", "<=", `${string}\uf8ff`),
    ];
  }

  async function updatePaths(oldPath: string, newPath: string) {
    const items = await api.getItems(oldPath, true, { once: true }).promise
      .value;
    for (const nestedItem of items) {
      const regexp = new RegExp(`^${oldPath}`);
      updateDoc(doc(db, dbPath.value, nestedItem.id!), {
        path: nestedItem.path.replace(regexp, newPath),
      });
    }
  }

  async function updateParentDateModified(...items: Item[]) {
    for (let path of new Set(items.map((i) => i.path))) {
      const parent = await api.getParentItem(path);
      if (!parent) continue;
      const updateData = { dateModified: Timestamp.now() };
      updateDoc(doc(db, dbPath.value, parent.id!), updateData);
    }
  }

  return { api, $reset };
});
