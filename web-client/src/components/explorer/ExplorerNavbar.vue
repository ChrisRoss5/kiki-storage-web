<script setup lang="ts">
import { useItemsStore } from "@/stores/items";
import { usePathStore } from "@/stores/path";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";

const itemsStore = useItemsStore();
const pathStore = usePathStore();
</script>

<template>
  <div class="flex items-center flex-wrap text-2xl">
    <RouterLink
      to="/"
      @drop.stop.prevent="itemsStore.handleDrop($event, '')"
      @dragover.stop.prevent="setDragOverStyle"
      @dragleave.stop.prevent="clearDragOverStyle"
      @dragend.stop.prevent="clearDragOverStyle"
      draggable="false"
    >
      <span class="material-symbols-outlined pr-2 pointer-events-none">
        cloud
      </span>
      <span class="pointer-events-none">Personal drive</span>
    </RouterLink>
    <template v-for="path in pathStore.folderPaths">
      <span class="material-symbols-outlined"> chevron_right </span>
      <RouterLink
        :to="`/${path}`"
        class="whitespace-pre"
        @drop.stop.prevent="itemsStore.handleDrop($event, path)"
        @dragover.stop.prevent="setDragOverStyle"
        @dragleave.stop.prevent="clearDragOverStyle"
        @dragend.stop.prevent="clearDragOverStyle"
        draggable="false"
      >
        {{ path.slice(path.lastIndexOf("/") + 1) }}
      </RouterLink>
    </template>
  </div>
</template>

<style scoped>
a {
  transition: transform 250ms, border 250ms;
  border-width: 2px;
  border-color: transparent;
  white-space: pre;
  &.dragover {
    transform: scale(1.25);
    border: 2px dashed hsl(var(--bc));
    + span {
      visibility: hidden;
    }
  }
}
</style>
