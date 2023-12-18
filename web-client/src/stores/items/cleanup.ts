import { getFullPath } from "@/utils/item";
import { usePathStore } from "../path";
import { useSettingsStore } from "../settings";
import { useTabsStore } from "../tabs";
import { stores as itemsStores} from "./index";
import { unref } from "vue";

export function useCleanup() {
  const tabsStore = useTabsStore();
  const settingsStore = useSettingsStore();
  console.log("HI");


  const onDelete = (items: Item[]) => {
    const folderPaths = items.filter((i) => i.isFolder).map(getFullPath);
    const isPathNotDeleted = (path: string) =>
      !folderPaths.some((p) => path.startsWith(p));

    for (const tab of tabsStore.tabs) {
      tab.expandedPaths = tab.expandedPaths?.filter(isPathNotDeleted) ?? [];
      while (!isPathNotDeleted(tab.path))
        tab.path = tab.path.split("/").slice(0, -1).join("/");
    }

/*     for (const store of itemsStores) {
      const items = store().items;
      store().items.value = items.filter((i) => !items.includes(i));
    }
 */
    console.log("cleaningup");
    settingsStore.setSetting("tabs", tabsStore.tabs);
  };

  return { onDelete };
}