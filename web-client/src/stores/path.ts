import { itemConverter } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { defineStore } from "pinia";
import { computed, reactive, ref, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCollection, useCurrentUser, useFirestore } from "vuefire";
import { useItemsStore } from "./items";
import { useSearchStore } from "./search";

export const usePathStore = defineStore("path", () => {
  const route = useRoute();
  const router = useRouter();
  const itemsStore = useItemsStore();
  const searchStore = useSearchStore();

  const roots = reactive({
    "/drive": "Drive",
    "/shared": "Shared",
    "/bin": "Bin",
  });
  const defaultRoot = "/drive" as keyof typeof roots;
  const root = ref<keyof typeof roots>(defaultRoot);
  const folderPaths = ref<string[]>([]);
  const currentPath = computed(() => folderPaths.value.at(-1) ?? "");

  checkPath(route.path);

  const user = useCurrentUser();
  const db = useFirestore();
  const dbPath = `app/drive/${user.value?.uid}`;

  const items = useCollection(
    query(
      collection(db, dbPath),
      where("path", "==", currentPath.value),
    ).withConverter(itemConverter),
  );

  watch(
    items,
    (items) => {
      itemsStore.items = [...items].map((i) => ({ ...i }));
    },
    { deep: true },
  );

  watchEffect(async () => {
    if (!route.meta.requiresAuth) return;
    let newPath = decodeURIComponent(route.path.replace(/\/+/g, "/"));
    if (newPath.endsWith("/")) newPath = newPath.slice(0, -1);
    if (!checkPath(newPath)) return;
    console.log("NEW PATH: ", newPath); // todo
    const pathSplit = newPath.split("/").slice(2);
    folderPaths.value = pathSplit.map((_, i) =>
      pathSplit.slice(0, i + 1).join("/"),
    );
    console.log("currentPath: ", currentPath.value); // todo

    //const items = await
    /* itemsStore.items = await api.getItems(newPath);
    searchStore.updateSearchedItems(); */
  });

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
    router.push({ path: root + path });
  }

  return { root, folderPaths, currentPath, push };
});
