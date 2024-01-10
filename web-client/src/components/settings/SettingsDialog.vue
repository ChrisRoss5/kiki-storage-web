<script setup lang="ts">
import Dialog from "@/components/Dialog.vue";
import { $breakpoints } from "@/main";
import { useSettingsStore } from "@/stores/settings/index";
import { computed, ref, watch } from "vue";
import Themes from "./Themes.vue";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<(e: "close") => void>();
const settingsStore = useSettingsStore();

const showThemes = ref(false);

const defaultFontSizeDesktop = "16px";
const defaultFontSizeMobile = "12px";

const disableTransitions = computed({
  get: () => settingsStore.settings.disableTransitions,
  set: (boolean) => settingsStore.setSetting("disableTransitions", boolean),
});
const hideFilesInFileTree = computed({
  get: () => settingsStore.settings.hideFilesInTree,
  set: (boolean) => settingsStore.setSetting("hideFilesInTree", boolean),
});
const desktopZoom = computed({
  get: () => settingsStore.settings.desktopZoom,
  set: (number) => settingsStore.setSetting("desktopZoom", number),
});
const mobileZoom = computed({
  get: () => settingsStore.settings.mobileZoom,
  set: (number) => settingsStore.setSetting("mobileZoom", number),
});
watch(disableTransitions, (disableTransitions) => {
  const method = disableTransitions ? "add" : "remove";
  document.documentElement.classList[method]("no-transitions");
});
watch(desktopZoom, (desktopZoom) => {
  if ($breakpoints.lgAndUp)
    document.documentElement.style.fontSize = `calc(${defaultFontSizeDesktop} * ${desktopZoom})`;
});
watch(mobileZoom, (mobileZoom) => {
  if (!$breakpoints.lgAndUp)
    document.documentElement.style.fontSize = `calc(${defaultFontSizeMobile} * ${mobileZoom})`;
});
</script>

<template>
  <Dialog
    :show="props.show"
    :closeOutside="true"
    :modalBoxStyle="{ 'max-width': '80vw' }"
    @close="emit('close')"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <button
          v-if="showThemes"
          class="dsy-btn dsy-btn-primary !leading-3"
          @click="showThemes = false"
          v-wave
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        Settings {{ showThemes ? "/ Themes" : "" }}
      </div>
    </template>
    <template #content>
      <div class="py-1">
        <Themes v-if="showThemes" />
        <div class="flex flex-col gap-3" v-else>
          <label class="cursor-pointer">
            <input
              type="checkbox"
              v-model="disableTransitions"
              class="dsy-checkbox align-text-bottom"
            />
            <span class="ml-2">Disable transitions</span>
          </label>
          <label class="cursor-pointer">
            <input
              type="checkbox"
              v-model="hideFilesInFileTree"
              class="dsy-checkbox align-text-bottom"
            />
            <span class="ml-2">Hide files in File Tree</span>
          </label>
          <div>
            Desktop Zoom:
            <input
              type="range"
              v-model="desktopZoom"
              min="0.5"
              max="1.5"
              step="0.05"
              class="dsy-range dsy-range-xs transition-all"
            />
          </div>
          <div>
            Mobile Zoom:
            <input
              type="range"
              v-model="mobileZoom"
              min="0.5"
              max="1.5"
              step="0.05"
              class="dsy-range dsy-range-xs"
            />
          </div>
          <div class="flex w-full gap-3">
            Theme:
            <Themes class="pointer-events-none" :onlyActiveTheme="true" />
            <button class="dsy-btn" @click="showThemes = true" v-wave>
              Change
            </button>
          </div>
        </div>
      </div>
    </template>
    <template v-if="!showThemes" #actions>
      <button class="dsy-btn ml-3" @click.prevent="settingsStore.reset" v-wave>
        Reset to default
      </button>
    </template>
  </Dialog>
</template>
