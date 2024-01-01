import { toBytes, units } from "@/utils/format";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useItemFirestoreStore } from "./items/firebase/firestore";
import { useSearchItemStore } from "./items/manager";
import { usePathStore } from "./path";

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
  const searchItemStore = useSearchItemStore();
  const { api: firestoreApi } = useItemFirestoreStore();
  const pathStore = usePathStore();

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
  watch(
    () => pathStore.currentRoot,
    () => searchItemStore.isOpen && queryItems(),
  );

  async function queryItems() {
    searchItemStore.isOpen = areFiltersActive.value;
    if (!searchItemStore.isOpen) return;
    searchItemStore.setDbItems(firestoreApi.searchItems(filters.value));
  }
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
    sizeFilter,
    type,
    filters,
    areFiltersActive,
    resetSizeFilter,
    reset,
  };
});
