import { defineStore } from "pinia";
import { WatchStopHandle, computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemsFirestoreStore } from "./items/firestore";
import { useItemsStore } from "./items/items";
import { useSearchStore } from "./search";
import { _RefFirestore } from "vuefire";

export const usePathStore = defineStore("path", () => {
  const route = useRoute();
  const router = useRouter();
  const itemsStore = useItemsStore();
  const searchStore = useSearchStore();
  const { api } = useItemsFirestoreStore();

  const roots = reactive({
    "/drive": "Drive",
    "/shared": "Shared",
    "/bin": "Bin",
  });
  const defaultRoot = "/drive" as keyof typeof roots;
  const root = ref<keyof typeof roots>(defaultRoot);
  const rootName = computed(() => roots[root.value]);
  const folderPaths = ref<string[]>([]);
  const currentPath = computed(() => folderPaths.value.at(-1) ?? "");

  let unwatch: WatchStopHandle;
  watch(
    () => route.path,
    async (newPath, oldPath) => {
      if (!route.meta.requiresAuth) return;
      let _newPath = decodeURIComponent(newPath.replace(/\/+/g, "/"));
      if (_newPath.endsWith("/")) _newPath = _newPath.slice(0, -1);
      if (!checkPath(_newPath)) return;
      const pathSplit = _newPath.split("/").slice(2);
      folderPaths.value = pathSplit.map((_, i) =>
        pathSplit.slice(0, i + 1).join("/"),
      );

      if (unwatch) unwatch();
      if (oldPath) api.unuseSource(oldPath);

      const items = api.getItems(currentPath.value);
      unwatch = watch(
        items,
        (items) => {
          console.log("UPDATING ITEMS: ", items); // todo
          itemsStore.items = items.map((i) => ({
            ...itemsStore.items.find((i2) => i2.id == i.id),
            ...i,
          }));
        },
        { deep: true },
      );

      //const items = await
      /* itemsStore.items = await api.getItems(newPath);
    searchStore.updateSearchedItems(); */
    },
    { immediate: true },
  );

  function checkPath(path: string) {
    if (Object.keys(roots).some((r) => path.startsWith(r))) {
      const idx = path.indexOf("/", 1);
      const _root = path.slice(0, idx > 0 ? idx : undefined);
      root.value = _root as keyof typeof roots;
      return true;
    }
    router.replace({ path: `${defaultRoot}${path}` });
  }

  function updatePaths() {}

  function push(path: string) {
    router.push({ path: root.value + path });
  }

  return { root, rootName, folderPaths, currentPath, push };
});
