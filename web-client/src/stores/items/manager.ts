import { defineStore } from "pinia";
import { ref } from "vue";
import { ItemStoreBindings, createItemStore } from ".";

const defineItemStore = ({ id, path }: ItemStoreBindings) =>
  defineStore(id, createItemStore.bind({ id, path }));

type ItemStoreDefinition = ReturnType<typeof defineItemStore>;

// https://stackoverflow.com/questions/74467392/autocomplete-in-typescript-of-literal-type-and-string
export const itemStoreIds = ["items", "search-items", "navbar-items"] as const;
export type ItemStoreId = (typeof itemStoreIds)[number] | (string & {}); // nosonar
export type ItemStore = ReturnType<ItemStoreDefinition>;

export const storeDefs = itemStoreIds.map((id) => defineItemStore({ id }));
export const useItemStore = storeDefs[0];
export const useSearchItemStore = storeDefs[1];
export const useNavbarItemStore = storeDefs[2];

export const treeStoreDefs: Record<string, ItemStoreDefinition> = {};
export const getTreeStore = (path: string) => {
  if (path in treeStoreDefs) return treeStoreDefs[path];
  const newStore = defineItemStore({ id: `tree-items-${path}`, path });
  treeStoreDefs[path] = newStore;
  return newStore;
};

export const focusedItemStoreId = ref<ItemStoreId>("");

export const getAllItemStores = () =>
  Object.values(treeStoreDefs)
    .concat(storeDefs)
    .map((s) => s());

export const getFocusedItemStore = () =>
  getAllItemStores().find((s) => s.$id == focusedItemStoreId.value) ??
  useItemStore();

export const getTopmostOpenItemStore = () =>
  [useSearchItemStore(), useNavbarItemStore()].find((s) => s.isOpen);
