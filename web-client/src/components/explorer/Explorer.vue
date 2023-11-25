<script setup lang="ts">
import { useItemsStore } from "@/stores/items";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { provide } from "vue";
import ExplorerFooter from "./ExplorerFooter.vue";
import ExplorerGrid from "./ExplorerGrid.vue";
import ExplorerNavbar from "./navbar/ExplorerNavbar.vue";

const itemsStore = useItemsStore();

provide("isSearch", false);
</script>

<template>
  <div id="explorer" class="flex min-h-0 flex-1 flex-col gap-3 px-5 pt-3">
    <ExplorerNavbar />
    <template v-if="itemsStore.items.length">
      <ExplorerGrid class="flex-1" />
      <ExplorerFooter />
    </template>
    <div
      v-else
      class="flex-center rounded-badge mb-3 flex-1 flex-col gap-3 border-2 border-dashed border-base-content"
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

<style>
#explorer {
  background: linear-gradient(to bottom, oklch(var(--p) / 25%), transparent),
    radial-gradient(ellipse at bottom left, oklch(var(--s) / 25%), transparent),
    radial-gradient(ellipse at bottom right, oklch(var(--a) / 25%), transparent);
}
/* [data-theme="light"] #explorer {
  background: linear-gradient(to bottom, oklch(var(--p) / 25%), transparent),
    radial-gradient(ellipse at bottom left, oklch(var(--s) / 25%), transparent),
    radial-gradient(ellipse at bottom right, oklch(var(--a) / 25%), transparent);
} */
</style>
