<script setup lang="ts">
import { usePathStore } from "@/stores/path";
import { useTabsStore } from "@/stores/tabs";

const props = defineProps<{ path: string }>();

const tabsStore = useTabsStore();
const pathStore = usePathStore();
</script>

<template>
  <div class="ml-auto">
    <Transition name="fade">
      <div
        v-if="pathStore.currentPath.startsWith(path)"
        class="material-symbols-outlined transition-[transform,opacity]"
        :class="{
          '-rotate-90': pathStore.currentPath == path,
          'opacity-50': pathStore.currentPath != path,
        }"
      >
        south
      </div>
    </Transition>
  </div>
</template>
