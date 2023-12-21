import { getActivePinia } from "pinia";
import treeStores from "./items/tree-manager";

export default () => {
  for (const path in treeStores) delete treeStores[path];

  // https://pinia.vuejs.org/api/interfaces/pinia._StoreWithState.html#-reset
  // https://github.com/vuejs/pinia/discussions/1859
  try {
    (getActivePinia() as any)._s.forEach((store: any) => {
      try {
        store.$reset();
      } catch (e) {}
    });
  } catch (e) {
    location.reload();
  }
};
