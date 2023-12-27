<script setup lang="ts">
import { useItemStore } from "@/stores/items/manager";
import { useSettingsStore } from "@/stores/settings";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { computed, provide, ref } from "vue";
import ExplorerFooter from "./ExplorerFooter.vue";
import ExplorerGrid from "./ExplorerGrid.vue";
import LoaderIcon from "./LoaderIcon.vue";
import Uploads from "./Uploads.vue";
import FileTree from "./filetree/FileTree.vue";
import FileTreeResizer from "./filetree/FileTreeResizer.vue";
import ExplorerNavbar from "./navbar/ExplorerNavbar.vue";

const itemStore = useItemStore();
const settingsStore = useSettingsStore();

const fileTreeComp = ref<InstanceType<typeof FileTree> | null>(null);

const isThemeLight = computed(() => settingsStore.settings.theme == "light");

provide("isSearch", false);
provide("isFileTree", false);
provide("isThemeLight", isThemeLight);

const handleFileUpload = (e: Event) => {
  const { files } = e.target as HTMLInputElement;
  if (files) itemStore.createFiles(files);
};
</script>

<template>
  <div
    id="explorer"
    class="flex min-h-0 flex-1 select-none flex-col px-2 md:px-5"
    :class="{ 'pt-3': !isThemeLight }"
  >
    <Uploads />
    <ExplorerNavbar />
    <div class="flex min-h-0 flex-1 overflow-hidden">
      <FileTree ref="fileTreeComp" />
      <FileTreeResizer :file-tree-el="fileTreeComp?.fileTreeDiv ?? null" />
      <div class="relative mt-3 flex min-w-0 flex-1 flex-col">
        <LoaderIcon :loading="itemStore.itemsPending" />
        <!-- cannot use <template> wrapper because of <TransitionGroup> root  -->
        <div class="flex min-h-0 flex-1 flex-col" v-if="itemStore.items.length">
          <ExplorerGrid :item-store="itemStore" />
          <ExplorerFooter :item-store="itemStore" />
        </div>
        <label
          v-else-if="!itemStore.itemsPending && settingsStore.dbSettingsReady"
          class="flex-center expl-body mb-3 flex-1 flex-col gap-3 rounded-badge border-2 border-dashed border-base-content p-5 text-center overflow-hidden"
          @drop.stop.prevent="itemStore.handleDrop"
          @dragover.stop.prevent="setDragOverStyle"
          @dragleave.stop.prevent="clearDragOverStyle"
          @dragend.stop.prevent="clearDragOverStyle"
        >
          <span class="material-symbols-outlined pointer-events-none">
            draft
          </span>
          <div class="pointer-events-none text-2xl">
            {{
              $isTouchDevice
                ? "Tap to upload files"
                : "Drop files or create a new folder"
            }}
          </div>
          <input
            type="file"
            class="hidden"
            multiple
            @change="handleFileUpload"
          />
        </label>
        <LoaderIcon v-else-if="settingsStore.dbSettingsReady" :loading="true" />
      </div>
    </div>
  </div>
</template>
