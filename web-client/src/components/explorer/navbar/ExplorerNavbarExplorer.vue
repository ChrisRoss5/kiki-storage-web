<script setup lang="ts">
import CloseExplorer from "@/components/explorer/CloseExplorer.vue";
import ExplorerFooter from "@/components/explorer/ExplorerFooter.vue";
import ExplorerGrid from "@/components/explorer/ExplorerGrid.vue";
import LoaderIcon from "@/components/explorer/LoaderIcon.vue";
import { ItemStore, focusedItemStoreId } from "@/stores/items/manager";
import { onMounted, provide, ref } from "vue";

defineProps<{ itemStore: ItemStore }>();

provide("isThemeLight", true);

const navbarExplorerDiv = ref<HTMLDivElement | null>(null);

onMounted(() => {
  // check if overflowing client screen width
  const navbarExplorerDivWidth = navbarExplorerDiv.value!.offsetWidth;
  const navbarExplorerDivLeft = navbarExplorerDiv.value!.getBoundingClientRect()
    .left;
  const navbarExplorerDivRight = navbarExplorerDivLeft + navbarExplorerDivWidth;
  const clientWidth = document.documentElement.clientWidth;
  if (navbarExplorerDivRight > clientWidth) {
    navbarExplorerDiv.value!.style.left = `${clientWidth - navbarExplorerDivWidth}px`;
  }
});
</script>

<template>
  <div
    id="navbar-explorer"
    ref="navbarExplorerDiv"
    class="absolute left-0 top-full z-10 flex max-h-[70vh] w-screen md:w-auto origin-top-left scale-75 cursor-default flex-col overflow-auto rounded-box bg-base-100 px-4 shadow-lg transition-shadow"
    :class="{ 'focused-store': focusedItemStoreId == itemStore.$id }"
    @mousedown.stop="focusedItemStoreId = itemStore.$id"
  >
    <LoaderIcon :loading="itemStore.itemsPending" />
    <CloseExplorer @click="itemStore.isOpen = false" />
    <ExplorerGrid :item-store="itemStore" />
    <ExplorerFooter :item-store="itemStore" class="mt-3" />
  </div>
</template>
