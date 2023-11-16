<script setup lang="ts">
import { useItemsStore } from "@/stores/items/items";
import { provide } from "vue";
import ExplorerFooter from "./ExplorerFooter.vue";
import ExplorerGrid from "./ExplorerGrid.vue";
import ExplorerNavbar from "./ExplorerNavbar.vue";

const itemsStore = useItemsStore();

const isSearch = false;
provide("isSearch", isSearch);
</script>

<template>
  <div class="mx-5 mb-5 flex min-h-0 flex-1 flex-col gap-5">
    <ExplorerNavbar />
    <template v-if="itemsStore.items.length">
      <ExplorerGrid class="flex-1" />
      <ExplorerFooter />
    </template>
    <div
      v-else
      class="flex-center pointer-events-none flex-1 flex-col gap-3 rounded-2xl border-2 border-dashed border-base-content"
    >
      <span class="material-symbols-outlined"> draft </span>
      <div class="text-2xl">Drop files or create a new folder</div>
    </div>
  </div>
</template>
