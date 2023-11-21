import { mergeDeep } from "@/utils";
import { ref as dbRef, set, update } from "firebase/database";
import { defineStore } from "pinia";
import { computed, watch } from "vue";
import { useCurrentUser, useDatabase, useDatabaseObject } from "vuefire";
import { useShortDialogStore } from "../short-dialog";
import defaultSettings from "./default";

export const useSettingsStore = defineStore("settings", () => {
  const user = useCurrentUser();
  const db = useDatabase();
  const dbPath = computed(() => `settings/${user.value?.uid}`);
  const dbSettings = computed(() =>
    user.value ? useDatabaseObject<Settings>(dbRef(db, dbPath.value)) : null,
  );
  const dialogStore = useShortDialogStore();

  const settings = computed<Settings>(() =>
    mergeDeep(defaultSettings, dbSettings.value?.value),
  );

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
    isSearch?: boolean,
  ) => {
    const path = isSearch ? "searchColumns" : "columns";
    return update(dbRef(db, `${dbPath.value}/${path}`), columns);
  };
  const setTheme = (newTheme: Theme) => {
    return set(dbRef(db, `${dbPath.value}/theme`), newTheme);
  };
  const reset = async () => {
    if (!(await dialogStore.confirm("Reset all settings to default?"))) return;
    set(dbRef(db, dbPath.value), defaultSettings);
  };

  return {
    settings,
    updateColumns,
    setTheme,
    reset,
  };
});
