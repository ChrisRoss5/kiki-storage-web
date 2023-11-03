import api from "@/scripts/api";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useItemsStore } from "./items";

export const useSearchStore = defineStore("search", () => {
  const itemsStore = useItemsStore();
  const query = ref("");
  const isOpen = ref(false);
  const itemsFound = ref(false);

  watch(query, async (query) => {
    isOpen.value = !!query.length;
    if (!query.length) return;
    const items = await api.searchItems(query);
    itemsFound.value = !!items.length;
    resetSearch();
    for (const item of items) {
      const existingItem = itemsStore.items.find((i) => i.id == item.id);
      if (!existingItem)
        itemsStore.items.push({
          ...item,
          isSearched: true,
          isSearchedNew: true,
        });
      else existingItem.isSearched = true;
    }
  });

  const resetSearch = () => {
    for (const item of itemsStore.items)
      item.isSearched = item.isSearchedNew = false;
  };
  const show = () => {
    isOpen.value = !!query.value.length;
  };
  const close = () => {
    isOpen.value = false;
  };

  return { query, isOpen, itemsFound, show, close };
});
