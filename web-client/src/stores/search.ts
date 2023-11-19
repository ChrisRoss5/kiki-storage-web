import { toBytes, units } from "@/utils/format";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { _RefFirestore } from "vuefire";
import { useItemsStore, useSearchItemsStore } from "./items";
import { useItemsFirestoreStore } from "./items/firestore";

export interface SizeFilter {
  min: number;
  max: number;
  minSuffix: (typeof units)[number];
  maxSuffix: (typeof units)[number];
}

const initialSizeFilter: SizeFilter = {
  min: 0,
  max: 0,
  minSuffix: "MB",
  maxSuffix: "MB",
};

export const useSearchStore = defineStore("search", () => {
  const itemsStore = useItemsStore();
  const searchItemsStore = useSearchItemsStore();
  const { api } = useItemsFirestoreStore();

  // todo: https://stackoverflow.com/questions/46573804/firestore-query-documents-startswith-a-string
  const isOpen = ref(false);
  const query = ref("");
  const sizeFilter = ref<SizeFilter>({ ...initialSizeFilter });
  const type = ref<string>("");
  const filters = computed<SearchFilters>(() => ({
    query: query.value,
    minSize: toBytes(sizeFilter.value.min, sizeFilter.value.minSuffix),
    maxSize: toBytes(sizeFilter.value.max, sizeFilter.value.maxSuffix),
    type: type.value,
  }));

  watch(filters, queryItems);

  const items = ref<_RefFirestore<ItemCore[]>>();

  watch(
    items,
    (newItems) => {
      if (!newItems) return;
      console.log("UPDATING SEARCH ITEMS: ", newItems.value.length);
      searchItemsStore.items = newItems.value.map((i) => ({
        ...searchItemsStore.items.find((i2) => i2.id == i.id),
        ...i,
      }));
      setTimeout(() => {
        // replace items with those in itemsStore todo
        searchItemsStore.items = searchItemsStore.items.map(
          (i) => itemsStore.items.find((i2) => i2.id == i.id) || i,
        );
      }, 10);
    },
    { deep: true },
  );

  async function queryItems() {
    isOpen.value = Object.values(filters.value).some(Boolean);
    if (!isOpen.value) return items.value?.stop();
    items.value = api.searchItems(filters.value);
  }

  const updateSearchedItems = (newSearch?: Item[]) => {
    // todo
    searchItemsStore.items = (newSearch ?? searchItemsStore.items).map(
      (i) => itemsStore.items.find((_i) => _i.id == i.id) ?? i,
    );
  };
  const show = () => {
    if (!isOpen.value) queryItems();
    else isOpen.value = true;
  };
  const close = () => {
    items.value?.stop();
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
    sizeFilter,
    type,
    filters,
    updateSearchedItems,
    show,
    close,
    resetSizeFilter,
    reset,
  };
});
