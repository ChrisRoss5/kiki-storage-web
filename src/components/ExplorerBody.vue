<script setup lang="ts">
import { isFile } from "@/utils";
import { ref } from "vue";

const selectedItems = ref<(File | Folder)[]>([]);

defineProps<{ items: (File | Folder)[] }>();
defineExpose({ selectedItems, deselectAll });

const emit = defineEmits<{
  (e: "itemDblClicked", item: File | Folder): void;
}>();

function handleRowClick(item: File | Folder, e: MouseEvent) {
  if (e.ctrlKey)
    if (selectedItems.value.includes(item))
      selectedItems.value = selectedItems.value.filter((i) => i != item);
    else selectedItems.value.push(item);
  else selectedItems.value = [item];
}

function deselectAll() {
  selectedItems.value = [];
}
</script>

<template>
  <table class="dsy-table place-self-start">
    <thead>
      <th width="99%">Name</th>
      <th>Size</th>
      <th>Type</th>
      <th>Date added</th>
    </thead>
    <tbody>
      <tr
        v-for="item in items"
        :key="item.name"
        class="hover:bg-gray-500/20 cursor-pointer"
        :class="{ '!bg-gray-500/40': selectedItems.includes(item) }"
        @click="handleRowClick(item, $event)"
        @dblclick="emit('itemDblClicked', item)"
      >
        <td class="rounded-l-lg">
          <span
            class="fiv-viv text-xl mr-3"
            :class="isFile(item) ? `fiv-icon-${item.type}` : 'fiv-icon-folder'"
          ></span>
          {{ item.name }}
        </td>
        <td>{{ isFile(item) ? item.size : "" }}</td>
        <td>{{ isFile(item) ? item.type : "Folder" }}</td>
        <td class="rounded-r-lg">{{ item.dateAdded.toLocaleDateString() }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped></style>
