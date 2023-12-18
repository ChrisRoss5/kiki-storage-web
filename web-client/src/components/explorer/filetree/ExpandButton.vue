<script setup lang="ts">
import { useTabsStore } from "@/stores/tabs";
import { computed } from "vue";
import Chevron from "../Chevron.vue";

const props = defineProps<{ path: string }>();

const tabsStore = useTabsStore();

const isItemExpanded = computed(
  () => tabsStore.activeTab.expandedPaths?.includes(props.path),
);

const handleItemClick = (keepOpen?: boolean) => {
  const { expandedPaths = [] } = tabsStore.activeTab;
  const idx = expandedPaths.indexOf(props.path);
  if (isItemExpanded.value && idx != -1 && !keepOpen)
    expandedPaths.splice(idx, 1);
  else if (idx == -1) expandedPaths.push(props.path);
  tabsStore.updateActiveTab({ expandedPaths });
};
</script>

<template>
  <div
    class="!pointer-events-auto w-6 rounded-box !px-0 hover:bg-base-300"
    @click.stop.prevent="handleItemClick()"
    @dragover.stop.prevent="handleItemClick(true)"
    @dblclick.stop="null"
    v-wave
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
