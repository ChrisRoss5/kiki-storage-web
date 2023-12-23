import { getFullPath } from "@/utils/item";
import { useSettingsStore } from "../settings";
import { useTabsStore } from "../tabs";
import { treeStoreDefs } from "./manager";

export function useCleanup() {
  const tabsStore = useTabsStore();
  const settingsStore = useSettingsStore();

  const onMoveComplete = (items: Item[], newPath: string) => {
    const folders = items.filter((i) => i.isFolder);

    for (const tab of tabsStore.tabs) {
      for (const folder of folders) {
        const fullPath = getFullPath(folder);
        const newFullPath = `${newPath ? `${newPath}/` : ""}${folder.name}`;
        const regexp = new RegExp(`^${fullPath}`);
        if (tab.path.startsWith(fullPath))
          tab.path = tab.path.replace(regexp, newFullPath);
        tab.expandedPaths =
          tab.expandedPaths?.map((p) => {
            return p.startsWith(fullPath) ? p.replace(regexp, newFullPath) : p;
          }) ?? [];
      }
    }

    deleteStores(folders.map(getFullPath));
    settingsStore.setSetting("tabs", tabsStore.tabs);
  };

  const onDeleteComplete = (items: Item[]) => {
    const folderPaths = items.filter((i) => i.isFolder).map(getFullPath);
    const isPathNotDeleted = (path: string) =>
      !folderPaths.some((p) => path.startsWith(p));

    for (const tab of tabsStore.tabs) {
      tab.expandedPaths = tab.expandedPaths?.filter(isPathNotDeleted) ?? [];
      while (!isPathNotDeleted(tab.path))
        tab.path = tab.path.split("/").slice(0, -1).join("/");
    }

    deleteStores(folderPaths);
    settingsStore.setSetting("tabs", tabsStore.tabs);
  };

  const deleteStores = (folderFullPaths: string[]) => {
    for (const path in treeStoreDefs)
      if (folderFullPaths.some((p) => path.startsWith(p)))
        delete treeStoreDefs[path];
  };

  return { onMoveComplete, onDeleteComplete };
}
