<script setup lang="ts">
import * as utils from "@/scripts/utils";
import { useItemsStore } from "@/stores/items";
import { useSelectionRectStore } from "@/stores/selectionRect";
import ExplorerFooter from "./ExplorerFooter.vue";
import ExplorerNavbar from "./ExplorerNavbar.vue";
import ExplorerTable from "./ExplorerTable.vue";
import { ref, watch } from "vue";

const itemsStore = useItemsStore();
const selectionRectStore = useSelectionRectStore();

const explorerContainerEl = ref<HTMLDivElement | null>(null);
let interval: NodeJS.Timeout | null = null;

watch(
  () => selectionRectStore.scrollDirection,
  (direction) => {
    if (interval) clearInterval(interval);
    if (!direction) return;
    console.log("scrolling", direction);

    interval = setInterval(() => {
      explorerContainerEl.value!.scrollBy(0, direction == "up" ? -10 : 10);
    }, 10);
  }
);
</script>

<template>
  <div class="flex-1 flex flex-col mx-5 mb-5 gap-5 min-h-0">
    <ExplorerNavbar />
    <div
      id="explorer-container"
      ref="explorerContainerEl"
      class="flex-1 flex rounded-2xl overflow-x-hidden overflow-y-auto [&.dragover_tr:not(.folder)]:pointer-events-none"
      @drop.stop.prevent="itemsStore.handleDrop"
      @dragover.stop.prevent="utils.setDragOverStyle"
      @dragleave.stop.prevent="utils.clearDragOverStyle"
      @dragend.stop.prevent="utils.clearDragOverStyle"
      @keyup.esc="itemsStore.deselectAll"
      @mousedown.left="selectionRectStore.handleMouseDown"
    >
      <ExplorerTable v-if="itemsStore.items.length" />
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
