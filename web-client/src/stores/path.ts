import { defineStore } from "pinia";
import { WatchStopHandle, computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemsStore } from "./items";
import { useItemsFirestoreStore } from "./items/firestore";
import { useSearchStore } from "./search";
import { useSettingsStore } from "./settings";
import { roots } from "./settings/default";
import { useShortDialogStore } from "./short-dialog";
import { useTabsStore } from "./tabs";

export const getPathName = (path: string) => {
  if (path in roots) return roots[path as keyof typeof roots].name;
  return path.slice(path.lastIndexOf("/") + 1);
};

export const usePathStore = defineStore("path", () => {
  const route = useRoute();
  const router = useRouter();
  const itemsStore = useItemsStore();
  const searchStore = useSearchStore();
  const { api } = useItemsFirestoreStore();
  const settingsStore = useSettingsStore();
  const tabsStore = useTabsStore();
  const dialogStore = useShortDialogStore();

  const folderPaths = ref<string[]>([]);
  const currentPath = ref("");
  let isStartup = true;

  watch(
    () => tabsStore.activeTab,
    (activeTab) => {
      if (!settingsStore.dbSettings || activeTab.path == currentPath.value)
        return;
      if (isStartup) {
        isStartup = false;
        const startupPath = sanitizePath(route.path);
        if (activeTab.path != startupPath) {
          const startupTab = tabsStore.tabs.find((t) => t.path == startupPath);
          if (!startupTab) tabsStore.createTab(startupPath);
          else tabsStore.switchTab(startupTab);
          return ;
        }
      }
      console.log("NEW ACTIVE TAB: ", activeTab);
      push(activeTab.path);
    },
  );

  let unwatch: WatchStopHandle;
  watch(
    [() => route.path, () => settingsStore.dbSettings?.id],
    async ([newPath, dbSettingsId]) => {
      if (!dbSettingsId || !route.meta.requiresAuth) return;
      newPath = sanitizePath(newPath);
      if (!isPathValid(newPath)) return;

      console.log("NEW PATH: ", newPath);
      currentPath.value = newPath;
      tabsStore.updateTab(tabsStore.activeTab, newPath);
      const pathSplit = newPath.split("/");
      folderPaths.value = pathSplit.map((_, i) =>
        pathSplit.slice(0, i + 1).join("/"),
      );

      if (unwatch) unwatch();
      //if (oldPath) api.unuseSource(oldPath);
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
    },
    { immediate: true },
  );

  function loadItems() {}

  const isPathValid = (path: string) => {
    const idx = path.indexOf("/");
    const _root = path.slice(0, idx > 0 ? idx : undefined);
    const isValid = _root in roots;
    if (!isValid) {
      dialogStore.showError("Invalid path.");
    }
    return isValid;
  };
  const sanitizePath = (path: string) => {
    // regex to remove duplicate slashes and start/end slashes
    path = path.replace(/\/+/g, "/").replace(/(^\/)|(\/$)/g, "");
    path = decodeURIComponent(path);
    return path;
  };
  const pushOnTab = (path: string) => {
    path = sanitizePath(path);
    if (!isPathValid(path)) return;
    tabsStore.updateTab(tabsStore.activeTab, path);
    push(path);
  };
  const push = (path: string) => {
    console.log("PUSHING: ", path);
    router.push({ path: `/${path}` });
  }

  return { folderPaths, currentPath, pushOnTab };
});
