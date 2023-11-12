<script setup lang="ts">
import { provide } from "vue";
import ExplorerFooter from "./ExplorerFooter.vue";
import ExplorerNavbar from "./ExplorerNavbar.vue";
import ExplorerGrid from "./ExplorerGrid.vue";
import { useItemsStore } from "@/stores/items";

const itemsStore = useItemsStore();

const isSearch = false;
provide("isSearch", isSearch);
</script>

<template>
  <div class="flex-1 flex flex-col mx-5 mb-5 gap-5 min-h-0">
    <ExplorerNavbar />
    <template v-if="itemsStore.items.length">
      <ExplorerGrid />
      <ExplorerFooter />
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
