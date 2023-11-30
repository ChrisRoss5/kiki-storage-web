<script setup lang="ts">
import { useItemsStore } from "@/stores/items";
import { useSettingsStore } from "@/stores/settings";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { computed, provide } from "vue";
import ExplorerFooter from "./ExplorerFooter.vue";
import ExplorerGrid from "./ExplorerGrid.vue";
import ExplorerNavbar from "./navbar/ExplorerNavbar.vue";
import Uploads from "../Uploads.vue";

const itemsStore = useItemsStore();
const settingsStore = useSettingsStore();

const isThemeLight = computed(() => settingsStore.settings.theme == "light");

provide("isSearch", false);
provide("isThemeLight", isThemeLight);
</script>

<template>
  <div
    id="explorer"
    class="flex min-h-0 flex-1 flex-col gap-3 px-5"
    :class="{ 'pt-3': !isThemeLight }"
  >
    <ExplorerNavbar />
    <template v-if="itemsStore.items.length">
      <ExplorerGrid class="flex-1" />
      <ExplorerFooter />
    </template>
    <div
      v-else
      class="flex-center mb-3 flex-1 flex-col gap-3 rounded-badge border-2 border-dashed border-base-content"
      @drop.stop.prevent="itemsStore.handleDrop"
      @dragover.stop.prevent="setDragOverStyle"
      @dragleave.stop.prevent="clearDragOverStyle"
      @dragend.stop.prevent="clearDragOverStyle"
    >
      <span class="material-symbols-outlined pointer-events-none"> draft </span>
      <div class="pointer-events-none text-2xl">
        Drop files or create a new folder
      </div>
    </div>
    <Uploads />
  </div>
</template>
