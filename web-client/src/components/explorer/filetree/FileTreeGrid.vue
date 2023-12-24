<script setup lang="ts">
import { focusedItemStoreId, getTreeStore } from "@/stores/items/manager";
import { useTabsStore } from "@/stores/tabs";
import ExplorerGrid from "../ExplorerGrid.vue";

const props = defineProps<{ path: string }>();

const tabsStore = useTabsStore();
const itemStore = getTreeStore(props.path)();

const handleLineClick = () => {
  const { expandedPaths } = tabsStore.activeTab;
  if (!expandedPaths) return;
  expandedPaths.splice(expandedPaths.indexOf(props.path), 1);
  tabsStore.updateActiveTab({ expandedPaths });
};
</script>

<template>
  <div
    class="relative flex rounded-box transition-shadow"
    @mousedown.stop="focusedItemStoreId = itemStore.$id"
  >
    <div
      class="w-6 cursor-pointer opacity-50 transition-opacity hover:opacity-100"
      @click.stop.prevent="handleLineClick"
      @mousedown.capture.stop="null"
      @dragover.stop.prevent="null"
      @drop.stop.prevent="null"
    >
      <div
        class="mx-auto rounded-box transition-[width,background-color]"
        :class="{
          'bg-accent w-1': focusedItemStoreId != itemStore.$id,
          'bg-secondary w-2': focusedItemStoreId == itemStore.$id,
        }"
        style="height: calc(100% - 0.5rem)"
      ></div>
    </div>
    <ExplorerGrid :item-store="itemStore" />
  </div>
</template>
