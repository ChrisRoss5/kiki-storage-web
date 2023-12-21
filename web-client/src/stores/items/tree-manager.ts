import { defineItemStore } from ".";

const stores: Record<string, ReturnType<typeof defineItemStore>> = {};

export const getTreeStore = (path: string) => {
  if (path in stores) return stores[path];
  const newStore = defineItemStore(`tree-items-${path}`);
  stores[path] = newStore;
  return newStore;
};

export default stores;
