<script setup lang="ts">
import * as utils from "@/scripts/utils";
import { useItemsStore } from "@/stores/items";
import { useSelectionRectStore } from "@/stores/selectionRect";
import ExplorerFooter from "./ExplorerFooter.vue";
import ExplorerNavbar from "./ExplorerNavbar.vue";
import ExplorerTable from "./ExplorerTable.vue";

const itemsStore = useItemsStore();
const selectionRectStore = useSelectionRectStore();
</script>

<template>
  <div class="flex-1 flex flex-col mx-5 mb-5 gap-5 min-h-0">
    <ExplorerNavbar />
    <div
      id="explorer-container"
      :ref="(el) => (selectionRectStore.explEl = el as HTMLElement)"
      class="relative flex-1 flex rounded-2xl overflow-x-hidden overflow-y-auto [&.dragover_tr:not(.folder)]:pointer-events-none"
      @drop.stop.prevent="itemsStore.handleDrop"
      @dragover.stop.prevent="utils.setDragOverStyle"
      @dragleave.stop.prevent="utils.clearDragOverStyle"
      @dragend.stop.prevent="utils.clearDragOverStyle"
      @keyup.esc="itemsStore.deselectAll"
      @mousedown.left="selectionRectStore.handleLeftMouseDown"
    >
      <template v-if="itemsStore.items.length">
        <ExplorerTable v-if="itemsStore.items.length" />
        <div
          :ref="(el) => (selectionRectStore.rectEl = el as HTMLElement)"
          class="absolute border border-primary bg-base-300 pointer-events-none z-50"
        ></div>
      </template>
      <div
        v-else
        class="flex-1 flex-center flex-col gap-3 border-2 border-base-content border-dashed rounded-2xl pointer-events-none select-none"
      >
        <span class="material-symbols-outlined"> draft </span>
        <div class="text-2xl">Drop files or create a new folder</div>
      </div>
    </div>
    <ExplorerFooter />
  </div>
</template>
