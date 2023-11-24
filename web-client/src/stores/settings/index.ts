import { mergeDeep } from "@/utils";
import { ref as dbRef, set, update } from "firebase/database";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useCurrentUser, useDatabase, useDatabaseObject } from "vuefire";
import { useShortDialogStore } from "../short-dialog";
import defaultSettings from "./default";

export const useSettingsStore = defineStore("settings", () => {
  const user = useCurrentUser();
  const db = useDatabase();
  const dbPath = computed(() => `settings/${user.value?.uid}`);
  const dbSettings = computed(() =>
    user.value
      ? useDatabaseObject<Settings>(dbRef(db, dbPath.value)).value
      : null,
  );
  const dialogStore = useShortDialogStore();

  const settings = computed<Settings>(() => {
    return mergeDeep(defaultSettings, dbSettings.value);
  });

  const updateSettings = (newSettings: Partial<Settings>) => {
    return update(dbRef(db, dbPath.value), newSettings);
  };

  watch(
    () => settings.value?.theme,
    (theme) => {
      if (!theme) return;
      document.documentElement.dataset.theme = theme;
      localStorage.setItem("theme", theme);
    },
  );

  const updateColumns = (
    columns: Partial<ColumnSettings>,
    isSearch: boolean,
  ) => {
    const path: keyof Settings = isSearch ? "searchColumns" : "columns";
    return update(dbRef(db, `${dbPath.value}/${path}`), columns);
  };
  const setView = (view: ExplorerView, isSearch: boolean) => {
    const path: keyof Settings = isSearch ? "searchView" : "view";
    return set(dbRef(db, `${dbPath.value}/${path}`), view);
  };
  const setTheme = (newTheme: Theme) => {
    return set(dbRef(db, `${dbPath.value}/theme`), newTheme);
  };
  const setTabs = (tabs: Tab[]) => {
    return set(dbRef(db, `${dbPath.value}/tabs`), tabs);
  };
  const setActiveTabId = (id: TabId) => {
    return set(dbRef(db, `${dbPath.value}/activeTabId`), id);
  };
  const reset = async () => {
    if (!(await dialogStore.confirm("Reset all settings to default?"))) return;
    set(dbRef(db, dbPath.value), defaultSettings);
  };

  return {
    dbSettings,
    settings,
    updateSettings,
    updateColumns,
    setView,
    setTheme,
    setTabs,
    setActiveTabId,
    reset,
  };
});
