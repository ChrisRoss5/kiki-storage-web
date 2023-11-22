<script setup lang="ts">
import { useItemsStore } from "@/stores/items";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { provide } from "vue";
import ExplorerFooter from "./ExplorerFooter.vue";
import ExplorerGrid from "./ExplorerGrid.vue";
import ExplorerNavbar from "./navbar/ExplorerNavbar.vue";
import ExplorerCards from "./ExplorerCards.vue";

const itemsStore = useItemsStore();

provide("isSearch", false);
</script>

<template>
  <div class="mx-5 mb-5 flex min-h-0 flex-1 flex-col gap-5">
    <ExplorerCards />
    <ExplorerNavbar />
    <template v-if="itemsStore.items.length">
      <ExplorerGrid class="flex-1" />
      <ExplorerFooter />
    </template>
    <div
      v-else
      class="flex-center flex-1 flex-col gap-3 rounded-2xl border-2 border-dashed border-base-content"
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
  </div>
</template>
