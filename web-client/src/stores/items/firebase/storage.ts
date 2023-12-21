// https://firebase.google.com/docs/storage/web/download-files
// gsutil cors set storage-cors-config.json gs://dropbox-clone-716f7.appspot.com

import { deleteObject, getBlob, ref as storageRef } from "firebase/storage";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useCurrentUser, useFirebaseStorage, useStorageFile } from "vuefire";
import { useShortDialogStore } from "../../short-dialog";
import { useItemsFirestoreStore } from "./firestore";

export const useItemsStorageStore = defineStore("items-storage", () => {
  const user = useCurrentUser();
  const storage = useFirebaseStorage();
  const itemsFirestoreStore = useItemsFirestoreStore();
  const dialogStore = useShortDialogStore();
  const storagePath = computed(() => `user/${user.value?.uid}/`);

  const itemsUploading = ref<Item[]>([]);

  const api = {
    createFiles(items: Item[], files: FileList) {
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i)!;
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
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.name}${item.type ? `.${item.type}` : ""}`;
      a.click();
      URL.revokeObjectURL(url);
    },
  };

  return { itemsUploading, api };
});
