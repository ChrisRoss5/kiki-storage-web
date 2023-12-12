<script setup lang="ts">
import { useItemsStore } from "@/stores/items";
import { usePathStore } from "@/stores/path";
import { useSettingsStore } from "@/stores/settings";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { computed, provide } from "vue";
import Uploads from "../Uploads.vue";
import ExplorerFooter from "./ExplorerFooter.vue";
import ExplorerGrid from "./ExplorerGrid.vue";
import LoaderIcon from "./LoaderIcon.vue";
import FileTree from "./filetree/FileTree.vue";
import ExplorerNavbar from "./navbar/ExplorerNavbar.vue";

const itemsStore = useItemsStore();
const settingsStore = useSettingsStore();
const pathStore = usePathStore();

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
    <Uploads />
    <ExplorerNavbar />
    <div class="flex min-h-0 flex-1">
      <FileTree class="hidden" />
      <div class="relative flex flex-1 flex-col">
        <LoaderIcon :loading="itemsStore.itemsPending" />
        <template v-if="itemsStore.items.length">
          <ExplorerGrid
            class="flex-1"
            :items-store="itemsStore"
            :current-path="pathStore.currentPath"
          />
          <ExplorerFooter :items-store="itemsStore" />
        </template>
        <div
          v-else-if="!itemsStore.itemsPending"
          class="flex-center expl-body mb-3 flex-1 flex-col gap-3 rounded-badge border-2 border-dashed border-base-content"
          @drop.stop.prevent="itemsStore.handleDrop"
          @dragover.stop.prevent="setDragOverStyle"
          @dragleave.stop.prevent="clearDragOverStyle"
          @dragend.stop.prevent="clearDragOverStyle"
        >
          <span class="material-symbols-outlined pointer-events-none">
            draft
          </span>
          <div class="pointer-events-none text-2xl">
            Drop files or create a new folder
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
