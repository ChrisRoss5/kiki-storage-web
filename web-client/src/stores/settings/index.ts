import { ref as dbRef, set, update } from "firebase/database";
import { defineStore } from "pinia";
import { computed, watch } from "vue";
import { useCurrentUser, useDatabase, useDatabaseObject } from "vuefire";
import defaultSettings from "./default";
import { useShortDialogStore } from "../short-dialog";
import { mergeDeep } from "@/utils";

export const useSettingsStore = defineStore("settings", () => {
  const user = useCurrentUser();
  const db = useDatabase();
  const dbPath = `settings/${user.value?.uid}`;
  const dbSettings = useDatabaseObject<Settings>(dbRef(db, dbPath));
  const dialogStore = useShortDialogStore();

  const settings = computed<Settings>(() =>
    mergeDeep(defaultSettings, dbSettings.value),
  );

  watch(
    () => settings.value.theme,
    (theme) => {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem("theme", theme);
    },
  );

  const updateColumns = async (columns: Partial<ColumnSettings>) => {
    update(dbRef(db, `${dbPath}/columns`), columns);
  };
  const setTheme = async (newTheme: Theme) => {
    set(dbRef(db, `${dbPath}/theme`), newTheme);
  };
  const reset = async () => {
    if (!(await dialogStore.confirm("Reset all settings to default?"))) return;
    set(dbRef(db, dbPath), defaultSettings);
  };

  return {
    settings,
    updateColumns,
    setTheme,
    reset,
  };
});
