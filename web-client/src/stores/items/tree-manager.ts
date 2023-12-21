import { defineItemStore } from ".";

const stores: Record<string, ReturnType<typeof defineItemStore>> = {};

export const getTreeStore = (path: string) => {
  if (path in stores) return stores[path];
  const newStore = defineItemStore({ id: `tree-items-${path}`, path });
  stores[path] = newStore;
  return newStore;
};

export default stores;
