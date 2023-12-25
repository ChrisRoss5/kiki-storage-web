import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
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
    const newTab: Tab = {
      path: path ?? defaultRoot,
      id: uuidv4(),
      expandedPaths: [],
    };
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
  const updateActiveTab = (newProps: Partial<Tab>) => {
    const _tabs = tabs.value.map((t) =>
      t.id == activeTab.value.id ? { ...t, ...newProps } : t,
    );
    settingsStore.setSetting("tabs", _tabs);
  };

  return {
    tabs,
    activeTab,
    createTab,
    deleteTab,
    switchTab,
    updateActiveTab,
  };
});
