<script setup lang="ts">
import CloseExplorer from "@/components/explorer/CloseExplorer.vue";
import ExplorerFooter from "@/components/explorer/ExplorerFooter.vue";
import ExplorerGrid from "@/components/explorer/ExplorerGrid.vue";
import LoaderIcon from "@/components/explorer/LoaderIcon.vue";
import { ItemStore, focusedItemStoreId } from "@/stores/items/manager";
import { provide } from "vue";

defineProps<{ itemStore: ItemStore }>();

provide("isThemeLight", true);
</script>

<template>
  <div
    id="navbar-explorer"
    class="absolute left-0 top-full z-10 flex max-h-[70vh] w-[130vw] origin-top-left scale-75 cursor-default flex-col overflow-auto rounded-box bg-base-100 px-4 shadow-lg transition-shadow lg:w-auto"
    :class="{ 'focused-store': focusedItemStoreId == itemStore.$id }"
    @mousedown.stop="focusedItemStoreId = itemStore.$id"
  >
    <!-- Using w-[130vw] because of transform: scale -->
    <LoaderIcon :loading="itemStore.itemsPending" />
    <CloseExplorer @click="itemStore.isOpen = false" />
    <ExplorerGrid :item-store="itemStore" />
    <ExplorerFooter :item-store="itemStore" class="mt-3" />
  </div>
</template>
