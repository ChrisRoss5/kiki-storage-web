import { mergeDeep } from "@/utils";
import { ref as dbRef, remove, set, update } from "firebase/database";
import { defineStore } from "pinia";
import { computed, watch } from "vue";
import { useCurrentUser, useDatabase, useDatabaseObject } from "vuefire";
import { useShortDialogStore } from "../short-dialog";
import getDefaultSettings from "./default";

export const useSettingsStore = defineStore("settings", () => {
  const user = useCurrentUser();
  const db = useDatabase();
  const dbPath = computed(() => `settings/${user.value?.uid}`);
  const dbSettings = computed(() =>
    user.value
      ? useDatabaseObject<Settings>(dbRef(db, dbPath.value)).value // undefined while loading, null if empty!
      : undefined,
  );
  const dbSettingsReady = computed(() => dbSettings.value !== undefined);
  const dialogStore = useShortDialogStore();

  const settings = computed<Settings>(() => {
    return mergeDeep(getDefaultSettings(), dbSettings.value);
  });

  const updateSettings = (newSettings: Partial<Settings>) => {
    return update(dbRef(db, dbPath.value), newSettings);
  };
  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Partial<Settings[K]>,
  ) => {
    return update(dbRef(db, `${dbPath.value}/${key}`), value);
  };
  const setSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    return set(dbRef(db, `${dbPath.value}/${key}`), value);
  };

  watch(
    () => settings.value.theme,
    (theme) => {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem("theme", theme);
    },
  );

  const reset = async () => {
    const msg =
      "Reset all settings to default? " +
      "This includes open tabs, views, column settings and other settings outside this window.";
    if (!(await dialogStore.confirm(msg))) return;
    remove(dbRef(db, dbPath.value));
  };

  return {
    dbSettings,
    dbSettingsReady,
    settings,
    updateSettings,
    updateSetting,
    setSetting,
    reset,
  };
});
