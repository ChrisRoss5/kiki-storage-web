<script setup lang="ts">
import { isFolder } from "@/utils";
import { computed } from "vue";

const props = defineProps<{
  items: (File | Folder)[];
  selectedItems?: (File | Folder)[];
}>();

const selectedItemsSize = computed(() => {
  const items = props.selectedItems;
  if (!items?.length || items.some(isFolder)) return "";
  return items.reduce((acc, i) => acc + (i as File).size, 0);
});
</script>

<template>
  <div class="bg-purple-950 shadow-md p-5 rounded-2xl">
    {{ items.length }}
    {{ items.length == 1 ? "item" : "items" }}
    <template v-if="selectedItems?.length">
      | {{ selectedItems.length }}
      {{ selectedItems.length == 1 ? "item" : "items" }} selected
      <template v-if="selectedItemsSize"> ({{ selectedItemsSize }}) </template>
    </template>
  </div>
</template>

<style scoped></style>
