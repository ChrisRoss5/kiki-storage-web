<script setup lang="ts">
import CloseExplorer from "@/components/explorer/CloseExplorer.vue";
import ExplorerFooter from "@/components/explorer/ExplorerFooter.vue";
import ExplorerGrid from "@/components/explorer/ExplorerGrid.vue";
import LoaderIcon from "@/components/explorer/LoaderIcon.vue";
import { ItemsStore } from "@/stores/items";
import { provide } from "vue";

defineProps<{
  itemsStore: ItemsStore;
  currentPath: string;
}>();

provide("isThemeLight", true);
</script>

<template>
  <div
    id="navbar-explorer"
    class="absolute left-0 top-full z-10 origin-top-left scale-75 cursor-default rounded-box bg-base-100 px-4 shadow-lg transition-shadow duration-300"
    :class="{ 'shadow-base-content/50': itemsStore.isFocused }"
    @mousedown="itemsStore.isFocused = itemsStore.isOpen = true"
  >
    <LoaderIcon :loading="itemsStore.itemsPending" />
    <CloseExplorer @click="itemsStore.isOpen = false" />
    <ExplorerGrid
      :items-store="itemsStore"
      :current-path="currentPath"
      class="max-h-[50vh] max-w-[70vw]"
    />
    <ExplorerFooter :items-store="itemsStore" class="mt-3" />
  </div>
</template>
