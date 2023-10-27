<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  items: Item[];
  selectedItems?: Item[];
}>();

const selectedItemsSize = computed(() => {
  const items = props.selectedItems;
  if (!items?.length || items.some((i) => i.isFolder)) return "";
  return items.reduce((acc, i) => acc + i.size!, 0);
});

function deleteItems() {
  
}
</script>

<template>
  <div class="flex items-center bg-purple-950 shadow-md px-6 rounded-2xl">
    <div class="p-4 pr-0">
      {{ items.length }}
      {{ items.length == 1 ? "item" : "items" }}
    </div>
    <div v-if="selectedItems?.length">
      <span class="px-3">|</span>{{ selectedItems.length }}
      {{ selectedItems.length == 1 ? "item" : "items" }} selected
      <template v-if="selectedItemsSize"> ({{ selectedItemsSize }}) </template>
    </div>
    <Transition name="fade">
      <div class="ml-auto flex" v-if="selectedItems?.length">
        <div
          class="dsy-tooltip p-4 cursor-pointer hover:bg-gray-500/20"
          data-tip="Download"
          @click=""
          v-wave
        >
          <span class="material-symbols-outlined"> download </span>
        </div>
        <div
          class="dsy-tooltip p-4 cursor-pointer hover:bg-gray-500/20"
          data-tip="Share"
          @click=""
          v-wave
        >
          <span class="material-symbols-outlined"> share </span>
        </div>
        <div
          class="dsy-tooltip p-4 cursor-pointer hover:bg-gray-500/20"
          data-tip="Move"
          @click=""
          v-wave
        >
          <span class="material-symbols-outlined"> drive_file_move </span>
        </div>
        <div
          class="dsy-tooltip p-4 cursor-pointer hover:bg-gray-500/20"
          data-tip="Rename"
          @click=""
          v-wave
        >
          <span class="material-symbols-outlined"> edit </span>
        </div>
        <div
          class="dsy-tooltip p-4 cursor-pointer hover:bg-gray-500/20"
          data-tip="Delete"
          @click="deleteItems"
          v-wave
        >
          <span class="material-symbols-outlined"> delete </span>
        </div>
      </div>
    </Transition>
  </div>
</template>
