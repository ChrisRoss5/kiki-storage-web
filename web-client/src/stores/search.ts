import api from "@/scripts/api";
import { sizeSuffixes, toBytes } from "@/scripts/utils";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useItemsStore } from "./items";

export interface SizeFilter {
  min: number;
  max: number;
  minSuffix: (typeof sizeSuffixes)[number];
  maxSuffix: (typeof sizeSuffixes)[number];
}

const initialSizeFilter: SizeFilter = {
  min: 0,
  max: 0,
  minSuffix: "MB",
  maxSuffix: "MB",
};

export const useSearchStore = defineStore("search", () => {
  const itemsStore = useItemsStore();

  const query = ref("");
  const isOpen = ref(false);
  const searchedItems = ref<Item[]>([]);
  const sizeFilter = ref<SizeFilter>({ ...initialSizeFilter });
  const minSize = computed(() =>
    toBytes(sizeFilter.value.min, sizeFilter.value.minSuffix)
  );
  const maxSize = computed(() =>
    toBytes(sizeFilter.value.max, sizeFilter.value.maxSuffix)
  );
  const type = ref<string>("");

  watch(query, queryItems);
  watch(minSize, queryItems);
  watch(maxSize, queryItems);
  watch(type, queryItems);

  async function queryItems() {
    isOpen.value = [query, minSize, maxSize, type].some((x) => !!x.value);
    if (!isOpen) return;
    searchedItems.value = await api.searchItems(
      query.value,
      minSize.value.toString(),
      maxSize.value.toString(),
      type.value
    );
    itemsStore.items = itemsStore.items.filter((i) => {
      i.isSearched = false;
      return !i.isSearchedNew;
    });
    updateSearchedItems();
  }

  const updateSearchedItems = () => {
    for (const item of searchedItems.value) {
      const existingItem = itemsStore.items.find((i) => i.id == item.id);
      if (!existingItem)
        itemsStore.items.push({
          ...item,
          isSearched: true,
          isSearchedNew: true,
        });
      else existingItem.isSearched = true;
    }
  };
  const show = () => {
    if (!isOpen.value) queryItems();
  };
  const close = () => {
    isOpen.value = false;
  };
  const resetSizeFilter = () => {
    sizeFilter.value = { ...initialSizeFilter };
  };
  const reset = () => {
    query.value = "";
    type.value = "";
    resetSizeFilter();
  };

  return {
    query,
    isOpen,
    searchedItems,
    sizeFilter,
    type,
    updateSearchedItems,
    show,
    close,
    resetSizeFilter,
    reset,
  };
});
