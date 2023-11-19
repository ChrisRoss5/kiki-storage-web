<script setup lang="ts">
import Dialog from "@/components/Dialog.vue";
import { useSettingsStore } from "@/stores/settings/index";
import { ref } from "vue";
import Themes from "./Themes.vue";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<(e: "close") => void>();
const settingsStore = useSettingsStore();

const showThemes = ref(false);
</script>

<template>
  <Dialog
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
        <Themes v-if="showThemes" />
        <div v-else class="flex w-full gap-3">
          Theme:
          <Themes class="pointer-events-none" :onlyActiveTheme="true" />
          <button class="dsy-btn" @click="showThemes = true" v-wave>
            Change
          </button>
        </div>
      </div>
    </template>
    <template #actions>
      <form method="dialog">
        <i> Changes save automatically </i>
        <button
          class="dsy-btn ml-3"
          @click.prevent="settingsStore.reset"
          v-wave
        >
          Reset to default
        </button>
      </form>
    </template>
  </Dialog>
</template>
