<script setup lang="ts">
import { getTreeStore } from "@/stores/items/manager";
import { useTabsStore } from "@/stores/tabs";
import ExplorerGrid from "../ExplorerGrid.vue";

const props = defineProps<{ path: string }>();

const tabsStore = useTabsStore();
const itemsStore = getTreeStore(props.path)();

const handleLineClick = () => {
  const { expandedPaths } = tabsStore.activeTab;
  if (!expandedPaths) return;
  expandedPaths.splice(expandedPaths.indexOf(props.path), 1);
  tabsStore.updateActiveTab({ expandedPaths });
};
</script>

<template>
  <div
    class="relative flex rounded-box"
    :class="{
      'focused-tree-store': itemsStore.isFocused,
    }"
    :style="{ 'clip-path': 'inset(0 0 0 0.62rem)' }"
    @mousedown.stop="itemsStore.isFocused = true"
  >
    <div
      class="w-6 cursor-pointer opacity-50 transition-opacity hover:opacity-100"
      @click.stop.prevent="handleLineClick"
      @mousedown.capture.stop="null"
      @dragover.stop.prevent="null"
      @drop.stop.prevent="null"
    >
      <div
        class="mx-auto w-1 rounded-box bg-accent"
        style="height: calc(100% - 0.5rem)"
      ></div>
    </div>
    <ExplorerGrid :item-store="itemsStore" :path="path" />
  </div>
</template>
