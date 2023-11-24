import { defineStore } from "pinia";
import { WatchStopHandle, computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemsStore } from "./items";
import { useItemsFirestoreStore } from "./items/firestore";
import { useSearchStore } from "./search";

export const roots = {
  drive: { name: "Drive", icon: "cloud" },
  shared: { name: "Shared", icon: "cloud" },
  bin: { name: "Bin", icon: "cloud" },
};

export const defaultRoot = "drive" satisfies keyof typeof roots;

export const getPathName = (path: string) => {
  if (path in roots) return roots[path as keyof typeof roots].name;
  return path.slice(path.lastIndexOf("/") + 1);
}

export const usePathStore = defineStore("path", () => {
  const route = useRoute();
  const router = useRouter();
  const itemsStore = useItemsStore();
  const searchStore = useSearchStore();
  const { api } = useItemsFirestoreStore();

  const root = ref<keyof typeof roots>(defaultRoot);
  const folderPaths = ref<string[]>([]);
  const currentPath = computed(() => folderPaths.value.at(-1) ?? "");

  let unwatch: WatchStopHandle;
  watch(
    () => route.path,
    async (newPath, oldPath) => {
      if (!route.meta.requiresAuth) return;
      // regex to remove duplicate slashes and start/end slashes
      newPath = newPath.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
      newPath = decodeURIComponent(newPath);
      if (!isPathValid(newPath)) return;

      const pathSplit = newPath.split("/");
      folderPaths.value = pathSplit.map((_, i) =>
        pathSplit.slice(0, i + 1).join("/"),
      );

      //console.log(folderPaths.value);


      if (unwatch) unwatch();
      if (oldPath) api.unuseSource(oldPath);

      const items = api.getItems(currentPath.value);
      unwatch = watch(
        items,
        (items) => {
          //console.log("UPDATING ITEMS: ", items); // todo
          itemsStore.items = items.map((i) => ({
            ...itemsStore.items.find((i2) => i2.id == i.id),
            ...i,
          }));
        },
        { deep: true },
      );

      /* todo  searchStore.updateSearchedItems(); */
    },
    { immediate: true },
  );

  function isPathValid(path: string) {
    //console.log("CHECKING PATH: ", path);
    const idx = path.indexOf("/");
    const _root = path.slice(0, idx > 0 ? idx : undefined);
    if (_root in roots) {
      root.value = _root as keyof typeof roots;
      return true;
    }
    router.replace({ path: `${defaultRoot}/${path}` });
    return false;
  }

  function updatePaths() {}

  function push(path: string) {
    router.push({ path: root.value + path });
  }

  return { root, folderPaths, currentPath, push };
});
