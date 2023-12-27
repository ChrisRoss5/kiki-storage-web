<script setup lang="ts">
import { usePathStore } from "@/stores/path";
import { useTabsStore } from "@/stores/tabs";
import { computed } from "vue";

const props = defineProps<{ path: string }>();

const tabsStore = useTabsStore();
const pathStore = usePathStore();

const expandedSubPaths = computed(
  () =>
    tabsStore.activeTab.expandedPaths?.filter(
      (p) => p.startsWith(props.path) && p != props.path,
    ),
);

const handleCollapseAll = () => {
  const { expandedPaths = [] } = tabsStore.activeTab;
  tabsStore.updateActiveTab({
    expandedPaths: expandedPaths.filter(
      (p) => !expandedSubPaths.value?.includes(p),
    ),
  });
};
</script>

<template>
  <div
    class="!pointer-events-auto ml-auto mr-3 flex items-center gap-3 self-stretch !p-0"
  >
    <Transition name="fade">
      <div
        v-if="expandedSubPaths?.length"
        class="material-symbols-outlined flex h-full w-6 cursor-pointer items-center transition-opacity hover:bg-base-300 group-hover:opacity-100"
        :class="{
          'opacity-0': !$isTouchDevice,
          'opacity-100': $isTouchDevice,
        }"
        @click.stop.prevent="handleCollapseAll"
        @dblclick.stop="null"
        v-wave
        :key="1"
        title="Collapse all subfolders"
      >
        collapse_all
      </div>
    </Transition>
    <Transition name="fade">
      <div
        v-if="pathStore.currentPath.startsWith(path)"
        class="material-symbols-outlined ml-auto transition-[transform,opacity]"
        :class="{
          '-rotate-90': pathStore.currentPath == path,
          'opacity-50': pathStore.currentPath != path,
        }"
        :key="2"
      >
        south
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-leave-active {
  display: none; /* Because of extra width */
}
</style>
