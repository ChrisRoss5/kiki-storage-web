import { defineItemsStore } from ".";

const stores: Record<string, ReturnType<typeof defineItemsStore>> = {};

export const getTreeStore = (path: string) => {
  if (path in stores) return stores[path];
  const newStore = defineItemsStore(`tree-items-${path}`);
  stores[path] = newStore;
  return newStore;
};

export default stores;
