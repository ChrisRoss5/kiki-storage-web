<script setup lang="ts">
import { useItemsStore, useSearchItemsStore } from "@/stores/items";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { inject, ref } from "vue";
import ExplorerTable from "./ExplorerTable.vue";

const isSearch = inject<boolean>("isSearch")!;

const itemsStore = isSearch ? useSearchItemsStore() : useItemsStore();
const selectionRectStore = useSelectionRectStore();

const explorerContainer = ref<HTMLElement | null>(null);
const rectEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="explorerContainer"
    class="explorer-container relative flex-1 flex rounded-2xl z-0 select-none overflow-x-hidden overflow-y-auto [&.dragover_tr:not(.folder)]:pointer-events-none [&.dragover_tr:not(.folder)]:opacity-25"
    @drop.stop.prevent="itemsStore.handleDrop"
    @dragover.stop.prevent="setDragOverStyle"
    @dragleave.stop.prevent="clearDragOverStyle"
    @dragend.stop.prevent="clearDragOverStyle"
    @mousedown.left="
      selectionRectStore.handleLeftMouseDown(
        explorerContainer!,
        rectEl!,
        itemsStore.items,
        isSearch,
        $event
      )
    "
  >
    <ExplorerTable v-if="itemsStore.items.length" />
    <div
      v-else
      class="flex-1 flex-center flex-col gap-3 border-2 border-base-content border-dashed rounded-2xl pointer-events-none"
    >
      <span class="material-symbols-outlined"> draft </span>
      <div class="text-2xl">Drop files or create a new folder</div>
    </div>
    <div
      ref="rectEl"
      class="absolute border border-primary bg-primary/20 pointer-events-none z-50"
    ></div>
  </div>
</template>
