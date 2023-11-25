import { defineStore } from "pinia";
import { computed } from "vue";
import { useSettingsStore } from "./settings";
import { defaultRoot } from "./settings/default";

export const useTabsStore = defineStore("tabs", () => {
  const settingsStore = useSettingsStore();

  const tabs = computed({
    get: () => settingsStore.settings.tabs,
    set: (tabs) => settingsStore.updateSettings({ tabs }),
  });
  const activeTab = computed(
    () => tabs.value.find((t) => t.id == settingsStore.settings.activeTabId)!,
  );

  let lastSelectedTabIdBeforeCreate: TabId | null = null;

  const createTab = (path?: string) => {
    lastSelectedTabIdBeforeCreate = activeTab.value.id;
    const newTab = { path: path ?? defaultRoot, id: crypto.randomUUID() };
    console.log("CREATING TAB: ", newTab);
    
    settingsStore.updateSettings({
      activeTabId: newTab.id,
      tabs: [...tabs.value, newTab],
    });
  };
  const deleteTab = (tab: Tab) => {
    const idx = tabs.value.findIndex((t) => t.id == tab.id);
    settingsStore.updateSettings({
      tabs: tabs.value.filter((t) => t.id != tab.id),
      ...(activeTab.value.id == tab.id
        ? {
            activeTabId: tabs.value.some(
              (t) => t.id == lastSelectedTabIdBeforeCreate,
            )
              ? lastSelectedTabIdBeforeCreate!
              : tabs.value.at(idx + 1)?.id ?? tabs.value.at(-2)!.id,
          }
        : {}),
    });
    lastSelectedTabIdBeforeCreate = null;
  };
  const switchTab = (tab: Tab) => {
    settingsStore.setSetting("activeTabId", tab.id);
    lastSelectedTabIdBeforeCreate = null;
  };

  return {
    tabs,
    activeTab,
    createTab,
    deleteTab,
    switchTab,
  };
});
