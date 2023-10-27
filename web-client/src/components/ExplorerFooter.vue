<script setup lang="ts">
import api from "@/scripts/api";
import { computed } from "vue";
import modal from "@/scripts/modal";

const props = defineProps<{
  items: Item[];
}>();

const selectedItems = computed(() => props.items.filter((i) => i.isSelected));
const selectedItemsSize = computed(() => {
  if (
    !selectedItems.value?.length ||
    selectedItems.value.some((i) => i.isFolder)
  )
    return "";
  return selectedItems.value.reduce((acc, i) => acc + i.size!, 0);
});

async function deleteItems() {
  const plural = selectedItems.value.length > 1;
  const toDelete = plural ? `${selectedItems.value.length} items` : "one item";
  if (!(await modal.confirm(`Are you sure you want to delete ${toDelete}?`)))
    return;
  api.deleteItems(selectedItems.value);
  for (const item of selectedItems.value) {
    props.items.splice(props.items.indexOf(item), 1);
  }
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
          v-show="selectedItems.length == 1"
          class="dsy-tooltip p-4 cursor-pointer hover:bg-gray-500/20"
          data-tip="Rename"
          @click.stop="
            selectedItems[0].isRenaming = !selectedItems[0].isRenaming
          "
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
