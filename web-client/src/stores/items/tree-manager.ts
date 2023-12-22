import { defineItemStore } from ".";

const storeDefs: Record<string, ReturnType<typeof defineItemStore>> = {};

export const getTreeStore = (path: string) => {
  if (path in storeDefs) return storeDefs[path];
  const newStore = defineItemStore({ id: `tree-items-${path}`, path });
  storeDefs[path] = newStore;
  return newStore;
};

export default storeDefs;
