import api from "@/firebase/sql-server-api";
import { toBytes, units } from "@/utils/format";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useItemsStore, useSearchItemsStore } from "./items";

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

const filterCheck: {
  [K in keyof SearchFilters]: (i: Item, filter: SearchFilters[K]) => boolean;
} = {
  query: (i, q) => i.name.startsWith(q),
  minSize: (i, s) => i.isFolder || s <= i.size!,
  maxSize: (i, s) => i.isFolder || i.size! <= s,
  type: (i, t) => {
    const types = t.split(",").map((tt) => tt.trim());
    return (
      !t ||
      (t == "Folders" && i.isFolder) ||
      (t == "Files" && !i.isFolder) ||
      types.includes(i.type)
    );
  },
  // todo: check underscores or escape them on server
};

export const useSearchStore = defineStore("search", () => {
  const itemsStore = useItemsStore();
  const searchItemsStore = useSearchItemsStore();

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

  async function queryItems() {
    isOpen.value = Object.values(filters.value).some(Boolean);
    if (isOpen.value) updateSearchedItems(await api.searchItems(filters.value));
  }

  const updateSearchedItems = (newSearch?: Item[]) => {
    searchItemsStore.items = (newSearch ?? searchItemsStore.items).map(
      (i) => itemsStore.items.find((_i) => _i.id == i.id) ?? i,
    );
  };
  const show = () => {
    if (!isOpen.value) queryItems();
    else isOpen.value = true;
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
  const itemPassesFilters = (item: Item) => {
    const keys = Object.keys(filters.value) as (keyof SearchFilters)[];
    return keys.every((k) => filterCheck[k](item, filters.value[k] as never));
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
    itemPassesFilters,
  };
});
