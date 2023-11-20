import { defineStore } from "pinia";
import { WatchStopHandle, computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemsStore } from "./items";
import { useItemsFirestoreStore } from "./items/firestore";
import { useSearchStore } from "./search";

export const useContextMenuStore = defineStore("context-menu", () => {
  const route = useRoute();
  const router = useRouter();
  const itemsStore = useItemsStore();
  const searchStore = useSearchStore();
  const { api } = useItemsFirestoreStore();


});
