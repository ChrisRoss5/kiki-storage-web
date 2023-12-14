import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemsStore } from "./items";
import { useItemsFirestoreStore } from "./items/firestore";
import { useSettingsStore } from "./settings";
import { RootKey, defaultRoot, roots } from "./settings/default";
import { useShortDialogStore } from "./short-dialog";
import { useTabsStore } from "./tabs";

export const getPathName = (path: string) => {
  if (path in roots) return roots[path as RootKey].name;
  return path.slice(path.lastIndexOf("/") + 1);
};

export const usePathStore = defineStore("path", () => {
  const route = useRoute();
  const router = useRouter();
  const itemsStore = useItemsStore();
  const { api: firestoreApi } = useItemsFirestoreStore();
  const settingsStore = useSettingsStore();
  const tabsStore = useTabsStore();
  const dialogStore = useShortDialogStore();

  const folderPaths = ref<string[]>([]);
  const currentPath = ref("");
  const currentRoot = computed(
    () => currentPath.value.split("/")[0] as RootKey,
  );
  let isStartup = true;

  watch(
    () => tabsStore.activeTab,
    (activeTab) => {
      if (activeTab.path == currentPath.value) return;
      if (isStartup) {
        isStartup = false;
        const startupPath = sanitizePath(route.path);
        if (!isPathValid(startupPath)) return;
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
    [() => route.path, () => settingsStore.dbSettingsReady],
    async ([newPath, dbSettingsReady]) => {
      if (!dbSettingsReady || !route.meta.requiresAuth) return;
      newPath = sanitizePath(newPath);
      if (!isPathValid(newPath)) return;
      currentPath.value = newPath;
      const pathSplit = newPath.split("/");
      folderPaths.value = pathSplit.map((_, i) =>
        pathSplit.slice(0, i + 1).join("/"),
      );
      itemsStore.setDbItems(firestoreApi.getItems(newPath));
      tabsStore.updateActiveTab({ path: newPath });
      tabsStore.switchTab(tabsStore.activeTab);
      isStartup = false;
    },
    { immediate: true },
  );

  const isPathValid = async (path: string) => {
    const prevPath = currentPath.value;
    const idx = path.indexOf("/");
    const _root = path.slice(0, idx > 0 ? idx : undefined);
    if (!(_root in roots)) {
      dialogStore.showError("Invalid root folder path.");
      replace(defaultRoot);
      return false;
    }
    if (path != _root)
      firestoreApi.getParentItem(path).then((parentItem) => {
        if (parentItem) return;
        dialogStore.showError(
          "Invalid path. The parent folder does not exist.",
        );
        replace(prevPath == currentPath.value ? _root : prevPath);
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
    tabsStore.updateActiveTab({ path });
    push(path);
  };
  const push = (path: string) => {
    router.push({ path: `/${path}` });
  };
  const replace = (path: string) => {
    router.replace({ path: `/${path}` });
  };

  return { folderPaths, currentPath, currentRoot, pushOnTab };
});
