import api from "@/firebase/api";
import { defineStore } from "pinia";
import { computed, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemsStore } from "./items";
import { useSearchStore } from "./search";

export const usePathStore = defineStore("path", () => {
  const route = useRoute();
  const router = useRouter();
  const itemsStore = useItemsStore();
  const searchStore = useSearchStore();

  const folderPaths = ref<string[]>([]);
  const currentPath = computed(() => folderPaths.value.at(-1) ?? "");

  watchEffect(async () => {
    if (!route.meta.requiresAuth) return;
    let newPath = decodeURIComponent(route.path.replace(/\/+/g, "/"));
    if (!newPath.startsWith("/drive")) return;
    newPath = newPath.replace("/drive", "");
    if (newPath.startsWith("/")) newPath = newPath.slice(1);
    if (newPath.endsWith("/")) newPath = newPath.slice(0, -1);
    console.log(newPath); // todo
    if (newPath) {
      const pathSplit = newPath.split("/");
      folderPaths.value = pathSplit.map((_, i) =>
        pathSplit.slice(0, i + 1).join("/")
      );
    } else folderPaths.value = [];
    //itemsStore.items = await api.getItems(newPath);
    //searchStore.updateSearchedItems();
  });

  function push(path: string) {
    router.push({ path: "/drive" + path });
  }

  return { folderPaths, currentPath, push };
});
