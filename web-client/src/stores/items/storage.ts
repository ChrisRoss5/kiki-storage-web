import { ref as storageRef } from "firebase/storage";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useCurrentUser, useFirebaseStorage, useStorageFile } from "vuefire";
import { useShortDialogStore } from "../short-dialog";
import { useItemsFirestoreStore } from "./firestore";

export const useItemsStorage = defineStore("items-storage", () => {
  const user = useCurrentUser();
  const storage = useFirebaseStorage();
  const { api: firestoreApi } = useItemsFirestoreStore();
  const dialogStore = useShortDialogStore();
  const storagePath = `user/${user.value?.uid}/`;

  const itemsUploading = ref<Item[]>([]);

  const api = {
    createFiles(items: Item[], files: FileList) {
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i)!;
        const item = items[i];
        const firestoreDoc = firestoreApi.createItemDoc();
        const _storageRef = storageRef(storage, storagePath + firestoreDoc.id);
        const storageFile = useStorageFile(_storageRef);
        item.id = firestoreDoc.id;
        item.storageFile = storageFile;
        itemsUploading.value.push(item);
        console.log("CREATING FILE: ", file);
        storageFile.upload(file)?.then(() => {
          console.log("UPLOADED FILE: ", file);
          itemsUploading.value.splice(itemsUploading.value.indexOf(item), 1);
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
  };

  /*   const getItemsUploading = (path: string) => {
    return itemsUploading.value.filter((i) => i.path == path);
  }; */

  return { itemsUploading, api };
});
