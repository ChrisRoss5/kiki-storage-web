<script setup lang="ts">
import { ref } from "vue";

const selectedItems = ref<Item[]>([]);

defineProps<{
  items: Item[];
  handleItemDblClicked: (item: Item) => void;
  handleDrop: (e: DragEvent, path?: string) => void;
}>();
defineExpose({ selectedItems, deselectAll });

function deselectAll() {
  selectedItems.value = [];
}

function getItemExtension(item: Item) {
  const split = item.name.split(".");
  return split.length > 1 ? split.at(-1) : "";
}

function handleRowClick(item: Item, e: MouseEvent) {
  if (e.ctrlKey)
    if (selectedItems.value.includes(item))
      selectedItems.value = selectedItems.value.filter((i) => i != item);
    else selectedItems.value.push(item);
  else selectedItems.value = [item];
}
</script>

<template>
  <table class="dsy-table place-self-start">
    <caption class="sr-only">
      Explorer table
    </caption>
    <thead class="pointer-events-none select-none">
      <th class="w-full">Name</th>
      <th>Size</th>
      <th>Type</th>
      <th>Date added</th>
    </thead>
    <tbody>
      <tr
        v-for="item in items"
        :key="item.name"
        class="cursor-pointer hover:bg-gray-500/20"
        :class="{
          '!bg-gray-500/40': selectedItems.includes(item),
          folder: item.isFolder,
        }"
        @drop.stop.prevent="handleDrop($event, `${item.path}/${item.name}`)"
        @click.stop="handleRowClick(item, $event)"
        @dblclick.stop="handleItemDblClicked(item)"
      >
        <td class="rounded-l-lg">
          <span
            class="fiv-viv text-xl mr-3"
            :class="
              !item.isFolder
                ? `fiv-icon-${getItemExtension(item)}`
                : 'fiv-icon-folder'
            "
          ></span>
          <span class="whitespace-pre"> {{ item.name }}</span>
        </td>
        <td>{{ !item.isFolder ? item.size : "" }}</td>
        <td>{{ !item.isFolder ? getItemExtension(item) : "Folder" }}</td>
        <!-- todo full extension name -->
        <td class="rounded-r-lg">{{ item.dateAdded.toLocaleDateString() }}</td>
      </tr>
    </tbody>
  </table>
</template>
