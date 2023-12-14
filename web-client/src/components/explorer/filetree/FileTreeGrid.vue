<script setup lang="ts">
import { useTreeStore } from "@/stores/items";
import { useTabsStore } from "@/stores/tabs";
import ExplorerGrid from "../ExplorerGrid.vue";

const props = defineProps<{ path: string }>();

const tabsStore = useTabsStore();

const handleLineClick = () => {
  const { expandedPaths } = tabsStore.activeTab;
  if (!expandedPaths) return;
  expandedPaths.splice(expandedPaths.indexOf(props.path), 1);
  tabsStore.updateActiveTab({ expandedPaths: expandedPaths });
};
</script>

<template>
  <div class="col-span-full grid grid-cols-[subgrid]">
    <div
      class="cursor-pointer opacity-50 transition-opacity hover:opacity-100"
      style="grid-column: 1"
      @click.stop.prevent="handleLineClick"
    >
      <div
        class="mx-auto w-1 rounded-box bg-accent"
        style="height: calc(100% - 0.5rem)"
      ></div>
    </div>
    <ExplorerGrid
      :items-store="useTreeStore(path)"
      :path="path"
      style="grid-column: 2"
    />
  </div>
</template>
