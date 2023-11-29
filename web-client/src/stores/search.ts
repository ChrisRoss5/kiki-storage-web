import { toBytes, units } from "@/utils/format";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { _RefFirestore } from "vuefire";
import { useItemsStore } from "./items";
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
  const searchItemsStore = useItemsStore(true);
  const { api } = useItemsFirestoreStore();

  const isOpen = ref(false);
  const isFocused = ref(false);
  const query = ref("");
  const sizeFilter = ref<SizeFilter>({ ...initialSizeFilter });
  const type = ref<string>("");
  const filters = computed<SearchFilters>(() => ({
    query: query.value,
    minSize: toBytes(sizeFilter.value.min, sizeFilter.value.minSuffix),
    maxSize: toBytes(sizeFilter.value.max, sizeFilter.value.maxSuffix),
    type: type.value,
  }));
  const areFiltersActive = computed(() =>
    Object.values(filters.value).some(Boolean),
  );

  watch(filters, queryItems);

  async function queryItems() {
    isOpen.value = isFocused.value = areFiltersActive.value;
    if (!isOpen.value) return searchItemsStore.stopDbItems();
    searchItemsStore.setDbItems(api.searchItems(filters.value));
  }
  const show = () => {
    if (!isOpen.value) return queryItems();
    isOpen.value = isFocused.value = true;
  };
  const hide = () => {
    searchItemsStore.stopDbItems();
    isOpen.value = isFocused.value = false;
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
    isFocused,
    sizeFilter,
    type,
    filters,
    areFiltersActive,
    show,
    hide,
    resetSizeFilter,
    reset,
  };
});
