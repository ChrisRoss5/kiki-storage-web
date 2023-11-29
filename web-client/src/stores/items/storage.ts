import { defineStore } from "pinia";
import { ref } from "vue";
import { useCurrentUser, useFirebaseStorage } from "vuefire";

export const useItemsStorage = defineStore("items-storage", () => {
  const user = useCurrentUser();
  const storage = useFirebaseStorage();
  const storagePath = `user/${user.value?.uid}/`;

  const itemsUploading = ref<Item[]>([]);

  const storageApi = {
    
  };

  return { storageApi };
});
