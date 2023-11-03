<script setup lang="ts">
import * as utils from "@/scripts/utils";
import { useItemsStore } from "@/stores/items";
import { useSelectionRectStore } from "@/stores/selectionRect";
import ExplorerTable from "./ExplorerTable.vue";
import { ref } from "vue";

const itemsStore = useItemsStore();
const selectionRectStore = useSelectionRectStore();

const explorerContainer = ref<HTMLElement | null>(null);
const rectEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="explorerContainer"
    class="explorer-container relative flex-1 flex rounded-2xl z-0 select-none overflow-x-hidden overflow-y-auto [&.dragover_tr:not(.folder)]:pointer-events-none"
    @drop.stop.prevent="itemsStore.handleDrop"
    @dragover.stop.prevent="utils.setDragOverStyle"
    @dragleave.stop.prevent="utils.clearDragOverStyle"
    @dragend.stop.prevent="utils.clearDragOverStyle"
    @mousedown.left="
      selectionRectStore.handleLeftMouseDown(
        explorerContainer!,
        rectEl!,
        $event
      )
    "
  >
    <template v-if="itemsStore.items.length">
      <ExplorerTable />
      <div
        ref="rectEl"
        class="absolute border border-primary bg-primary/20 pointer-events-none z-50"
      ></div>
    </template>
    <div
      v-else
      class="flex-1 flex-center flex-col gap-3 border-2 border-base-content border-dashed rounded-2xl pointer-events-none"
    >
      <span class="material-symbols-outlined"> draft </span>
      <div class="text-2xl">Drop files or create a new folder</div>
    </div>
  </div>
</template>
