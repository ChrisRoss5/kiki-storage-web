<script setup lang="ts">
import Dialog from "@/components/Dialog.vue";
import { useShortDialogStore } from "@/stores/short-dialog";
import { ref as dbRef, set } from "firebase/database";
import { computed, ref, watch } from "vue";
import { useCurrentUser, useDatabase, useDatabaseObject } from "vuefire";
import Themes from "./Themes.vue";
import defaultSettings from "./default";

const dialogStore = useShortDialogStore();
const props = defineProps<{ show: boolean }>();
const emit = defineEmits<(e: "close") => void>();

const user = useCurrentUser();
const db = useDatabase();
const dbPath = `settings/${user.value?.uid}`;
const dbSettings = useDatabaseObject<Settings>(dbRef(db, dbPath));
const settings = computed<Settings>(() => dbSettings.value ?? defaultSettings);

const showThemes = ref(false);

watch(settings, (settings) => {
  document.documentElement.dataset.theme = settings.theme;
  localStorage.setItem("theme", settings.theme);
});

const handleThemeUpdate = async (newTheme: Theme) => {
  set(dbRef(db, `${dbPath}/theme`), newTheme);
};
const handleReset = async () => {
  if (!(await dialogStore.confirm("Reset all settings to default?"))) return;
  set(dbRef(db, dbPath), defaultSettings);
};
</script>

<template>
  <Dialog
    v-if="settings"
    :show="props.show"
    :closeOutside="true"
    :modalBoxStyle="{ 'max-width': '80vw', 'max-height': '80vh' }"
    @close="emit('close')"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <button
          v-if="showThemes"
          class="dsy-btn dsy-btn-primary !leading-3"
          @click="showThemes = false"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        Settings {{ showThemes ? "/ Themes" : "" }}
      </div>
    </template>
    <template #content>
      <div class="py-1">
        <Themes
          v-if="showThemes"
          :activeTheme="settings.theme"
          :handleThemeUpdate="handleThemeUpdate"
        />
        <div v-else class="flex w-full gap-3">
          Theme:
          <Themes
            class="pointer-events-none"
            :activeTheme="settings.theme"
            :onlyActiveTheme="true"
          />
          <button class="dsy-btn" @click="showThemes = true" v-wave>
            Change
          </button>
        </div>
      </div>
    </template>
    <template #actions>
      <form method="dialog">
        <i> Changes save automatically </i>
        <button class="dsy-btn ml-3" @click.prevent="handleReset" v-wave>
          Reset to default
        </button>
      </form>
    </template>
  </Dialog>
</template>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 1s;
}
.slide-right-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
  position: absolute;
}
.slide-right-leave-to,
.slide-left-enter-from {
  transform: translateX(-100%);
  position: absolute;
}
</style>
