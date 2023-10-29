<script setup lang="ts">
import * as utils from "@/scripts/utils";
import { useItemsStore } from "@/stores/items";
import ExplorerFooter from "./ExplorerFooter.vue";
import ExplorerNavbar from "./ExplorerNavbar.vue";
import ExplorerTable from "./ExplorerTable.vue";

const itemsStore = useItemsStore();
</script>

<template>
  <div class="flex-1 flex flex-col mx-5 mb-5 gap-5">
    <ExplorerNavbar  />
    <div
      id="explorer-container"
      class="flex-1 flex rounded-2xl [&.dragover_tr:not(.folder)]:pointer-events-none"
      @drop.stop.prevent="itemsStore.handleDrop"
      @dragover.stop.prevent="utils.setDragOverStyle"
      @dragleave.stop.prevent="utils.clearDragOverStyle"
      @dragend.stop.prevent="utils.clearDragOverStyle"
      @keyup.esc="itemsStore.deselectAll"
    >
      <ExplorerTable v-if="itemsStore.items.length"  />
      <div
        v-else
        class="flex-1 flex-center flex-col gap-3 border-2 border-gray-500 border-dashed rounded-2xl pointer-events-none select-none"
      >
        <span class="material-symbols-outlined"> draft </span>
        <div class="text-2xl">Drop files or create a new folder</div>
      </div>
    </div>
    <ExplorerFooter />
  </div>
</template>
