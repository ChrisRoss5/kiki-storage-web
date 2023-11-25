<script setup lang="ts">
import { useSettingsStore } from "@/stores/settings/index";
import { computed } from "vue";

defineProps<{
  onlyActiveTheme?: boolean;
}>();

const settingsStore = useSettingsStore();

const activeTheme = computed(() => settingsStore.settings.theme);

const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
] satisfies Theme[];
</script>

<template>
  <div
    class="rounded-box grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    :class="{ '!grid-cols-1': onlyActiveTheme }"
  >
    <div
      v-for="theme in onlyActiveTheme ? [activeTheme] : themes"
      :key="theme"
      @click="!onlyActiveTheme && settingsStore.setSetting('theme', theme)"
      class="overflow-hidden rounded-btn border border-base-content/20 outline outline-2 outline-offset-2 outline-transparent hover:border-base-content/40"
      :class="{
        'outline-2': theme == activeTheme && !onlyActiveTheme,
        'outline-offset-2': theme == activeTheme && !onlyActiveTheme,
        'outline-primary': theme == activeTheme && !onlyActiveTheme,
      }"
      v-wave
    >
      <div
        :data-theme="theme"
        class="w-full cursor-pointer bg-base-100 font-sans text-base-content"
      >
        <div class="grid grid-cols-5 grid-rows-3">
          <div class="col-start-1 row-span-2 row-start-1 bg-base-200" />
          <div class="col-start-1 row-start-3 bg-base-300" />
          <div
            class="col-span-4 col-start-2 row-span-3 row-start-1 flex flex-col gap-1 bg-base-100 p-2"
          >
            <div class="font-bold">{{ theme }}</div>
            <div class="flex flex-wrap gap-1">
              <div
                v-for="color in ['primary', 'secondary', 'accent', 'neutral']"
                :class="`bg-${color} flex aspect-square w-5 items-center justify-center rounded lg:w-6`"
                :key="color"
              >
                <!-- todo fix colors? -->
                <div :class="`text-${color}-content text-sm font-bold`">A</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
