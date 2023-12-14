<script setup lang="ts">
import { useTabsStore } from "@/stores/tabs";
import { computed } from "vue";
import Chevron from "../Chevron.vue";

const props = defineProps<{ path: string }>();

const tabsStore = useTabsStore();

const isItemExpanded = computed(
  () => tabsStore.activeTab.expandedPaths?.includes(props.path),
);

const handleItemClick = () => {
  const { expandedPaths = [] } = tabsStore.activeTab;
  if (isItemExpanded.value)
    expandedPaths.splice(expandedPaths.indexOf(props.path), 1);
  else expandedPaths.push(props.path);
  tabsStore.updateActiveTab({ expandedPaths: expandedPaths });
};
</script>

<template>
  <div
    class="!pointer-events-auto rounded-box !px-0 hover:bg-base-300"
    @click.stop.prevent="handleItemClick"
    @dblclick.stop="null"
  >
    <Chevron
      :class="{
        'opacity-40': !isItemExpanded,
        'opacity-100': isItemExpanded,
      }"
      :is-expanded="isItemExpanded"
    />
  </div>
</template>
