import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemsStore } from "./items";
import { useItemsFirestoreStore } from "./items/firestore";
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
          return;
        }
      }
      push(activeTab.path);
    },
  );

  watch(
    [() => route.path, () => settingsStore.dbSettings?.id],
    async ([newPath, dbSettingsId]) => {
      if (!dbSettingsId || !route.meta.requiresAuth) return;
      newPath = sanitizePath(newPath);
      if (!isPathValid(newPath)) return;
      currentPath.value = newPath;
      tabsStore.updateTab(tabsStore.activeTab, newPath);
      const pathSplit = newPath.split("/");
      folderPaths.value = pathSplit.map((_, i) =>
        pathSplit.slice(0, i + 1).join("/"),
      );
      itemsStore.setDbItems(api.getItems(newPath));
    },
    { immediate: true },
  );

  const isPathValid = async (path: string) => {
    const prevPath = currentPath.value;
    const idx = path.indexOf("/");
    const _root = path.slice(0, idx > 0 ? idx : undefined);
    if (!(_root in roots)) {
      dialogStore.showError("Invalid root folder path.");
      return false;
    }
    if (path != _root)
      api.getParentItem(path).then((parentItem) => {
        if (parentItem) return;
        dialogStore.showError(
          "Invalid path. The parent folder does not exist.",
        );
        replace(prevPath);
      });
    return true;
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
    router.push({ path: `/${path}` });
  };
  const replace = (path: string) => {
    router.replace({ path: `/${path}` });
  };

  return { folderPaths, currentPath, pushOnTab };
});
