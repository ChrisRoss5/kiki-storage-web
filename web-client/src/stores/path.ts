import api from "@/scripts/api";
import { defineStore } from "pinia";
import { computed, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useItemsStore } from "./items";

export const usePathStore = defineStore("path", () => {
  const route = useRoute();
  const itemsStore = useItemsStore();

  const folderPaths = ref<string[]>([]);
  const currentPath = computed(() => folderPaths.value.at(-1) ?? "");

  watchEffect(async () => {
    let newPath = decodeURIComponent(route.path.replace(/\/+/g, "/"));
    if (newPath.startsWith("/")) newPath = newPath.slice(1);
    if (newPath.endsWith("/")) newPath = newPath.slice(0, -1);
    if (newPath) {
      const pathSplit = newPath.split("/");
      folderPaths.value = pathSplit.map((_, i) =>
        pathSplit.slice(0, i + 1).join("/")
      );
    } else folderPaths.value = [];
    itemsStore.items = await api.getItems(newPath);
    itemsStore.deselectAll();
  });

  return { folderPaths, currentPath };
});
