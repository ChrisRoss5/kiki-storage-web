// https://firebase.google.com/docs/storage/web/download-files
// gsutil cors set storage-cors-config.json gs://dropbox-clone-716f7.appspot.com

import { downloadBlob } from "@/utils/file";
import { getFullPath } from "@/utils/item";
import {
  deleteObject,
  getBlob,
  listAll,
  ref as storageRef,
} from "firebase/storage";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useCurrentUser, useFirebaseStorage, useStorageFile } from "vuefire";
import { useShortDialogStore } from "../../short-dialog";
import { useItemFirestoreStore } from "./firestore";

export const useItemStorageStore = defineStore("item-storage", () => {
  const user = useCurrentUser();
  const storage = useFirebaseStorage();
  const itemsFirestoreStore = useItemFirestoreStore();
  const dialogStore = useShortDialogStore();
  const storagePath = computed(() => `user/${user.value?.uid}/`);

  const itemsUploading = ref<Item[]>([]);

  const api = {
    createFiles(items: Item[], files: File[]) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const item = items[i];
        const firestoreDoc = itemsFirestoreStore.api.createItemDoc();
        const _storageRef = storageRef(
          storage,
          storagePath.value + firestoreDoc.id,
        );
        const storageFile = useStorageFile(_storageRef);
        item.id = firestoreDoc.id;
        item.storageFile = storageFile;
        itemsUploading.value.push(item);
        storageFile.upload(file)?.then(() => {
          itemsUploading.value.splice(itemsUploading.value.indexOf(item), 1);
          itemsFirestoreStore.api.createItem(item, firestoreDoc);
        });
      }
    },
    pauseUpload(item: Item) {
      item.storageFile?.uploadTask.pause();
    },
    pauseUploads() {
      itemsUploading.value.forEach(api.pauseUpload);
    },
    resumeUpload(item: Item) {
      item.storageFile?.uploadTask.resume();
    },
    resumeUploads() {
      itemsUploading.value.forEach(api.resumeUpload);
    },
    cancelUpload(item: Item) {
      item.storageFile?.uploadTask.cancel();
      itemsUploading.value.splice(itemsUploading.value.indexOf(item), 1);
    },
    async cancelUploads() {
      const msg = "Are you sure you want to cancel all uploads?";
      if (await dialogStore.confirm(msg))
        itemsUploading.value.forEach(api.cancelUpload);
    },
    deleteFile(item: Item) {
      const _storageRef = storageRef(storage, storagePath.value + item.id!);
      return deleteObject(_storageRef);
    },
    async downloadFile(item: Item) {
      const _storageRef = storageRef(storage, storagePath.value + item.id!);
      const blob = await getBlob(_storageRef);
      const filename = `${item.name}${item.type ? `.${item.type}` : ""}`;
      downloadBlob(blob, filename);
    },
    async downloadItems(items: Item[]) {
      const directoryHandle = await window.showDirectoryPicker();
      const allItems: Item[] = [];
      const itemPromises = [...items].map(async (item) => {
        if (item.isFolder) {
          const subitems = [
            ...(await itemsFirestoreStore.api.getItems(getFullPath(item), true)
              .promise.value),
          ];
          subitems.forEach(
            (i) => (i.path = i.path.replace(item.path + "/", "")),
          );
          allItems.push(...subitems);
        }
        item.path = "";
        allItems.push(item);
      });
      await Promise.all(itemPromises);
      const writePromises = allItems
        .filter((i) => !i.isFolder)
        .map(async (item) => {
          const pathSegments = item.path.split("/");
          let currentDirectoryHandle = directoryHandle;
          for (let i = 0; i < pathSegments.length - 1; i++) {
            const segment = pathSegments[i];
            currentDirectoryHandle =
              await currentDirectoryHandle.getDirectoryHandle(segment, {
                create: true,
              });
          }
          const fullName = `${item.name}${item.type ? `.${item.type}` : ""}`;
          const fileHandle = await currentDirectoryHandle.getFileHandle(
            fullName,
            { create: true },
          );
          const writableStream = await fileHandle.createWritable();
          const _storageRef = storageRef(storage, storagePath.value + item.id!);
          await writableStream.write(await getBlob(_storageRef));
          await writableStream.close();
        });
      await Promise.all(writePromises);
    },
    async deleteAll() {
      const listRef = storageRef(storage, storagePath.value);
      const { items } = await listAll(listRef);
      return Promise.allSettled(items.map(deleteObject));
    },
  };

  return { itemsUploading, api };
});
