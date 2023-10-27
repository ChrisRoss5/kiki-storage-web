<script setup lang="ts">
import api from "@/scripts/api";
import { ref } from "vue";

const props = defineProps<{
  items: Item[];
  handleItemOpen: (item: Item) => void;
  handleDrop: (e: DragEvent, path?: string) => void;
}>();

let lastSelectedItemIdx = 0;

const newItemName = ref("");

function getItemExtension(item: Item) {
  const split = item.name.split(".");
  return split.length > 1 ? split.at(-1) : "";
}

function handleRowSelect(item: Item, e: MouseEvent | KeyboardEvent) {
  if (e.ctrlKey) {
    if (item.isSelected) item.isSelected = false;
    else {
      item.isSelected = true;
      lastSelectedItemIdx = props.items.indexOf(item);
    }
  } else if (e.shiftKey) {
    props.items.forEach((i) => (i.isSelected = false));
    const start = Math.min(lastSelectedItemIdx, props.items.indexOf(item));
    const end = Math.max(lastSelectedItemIdx, props.items.indexOf(item));
    for (let i = start; i <= Math.min(end, props.items.length - 1); i++)
      props.items[i].isSelected = true;
  } else {
    props.items.forEach((i) => (i.isSelected = false));
    item.isSelected = true;
    lastSelectedItemIdx = props.items.indexOf(item);
  }
}

function renameItem(item: Item) {
  api.renameItem(item, newItemName.value);
}
</script>

<template>
  <table class="dsy-table place-self-start select-none">
    <caption class="sr-only">
      Explorer table
    </caption>
    <thead class="pointer-events-none">
      <th class="w-full">Name</th>
      <th>Size</th>
      <th>Type</th>
      <th>Date added</th>
    </thead>
    <tbody>
      <tr
        v-for="item in items"
        :key="item.name + item.path"
        class="cursor-pointer hover:bg-gray-500/20"
        :class="{
          '!bg-gray-500/40': item.isSelected,
          folder: item.isFolder,
        }"
        @drop.stop.prevent="handleDrop($event, `${item.path}/${item.name}`)"
        @click.stop="handleRowSelect(item, $event)"
        @dblclick.stop="handleItemOpen(item)"
        @keyup.space="handleRowSelect(item, $event)"
        @keyup.enter="handleItemOpen(item)"
        tabindex="0"
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
          <div v-if="item.isRenaming" class="inline-flex ml-2">
            <input
              v-model.trim="newItemName"
              type="text"
              placeholder="Press esc to cancel"
              class="dsy-join-item dsy-input dsy-input-secondary outline-none"
              @keyup.enter="renameItem(item)"
              @keyup.esc="item.isRenaming = false"
            />
            <button
              class="dsy-join-item dsy-btn dsy-btn-secondary"
              :class="{ 'dsy-btn-disabled': !newItemName }"
              @click="renameItem(item)"
              v-wave
            >
              <span class="material-symbols-outlined"> check </span>
            </button>
            <button
              class="dsy-join-item dsy-btn dsy-btn-secondary"
              :class="{ 'dsy-btn-disabled': !newItemName }"
              @click="item.isRenaming = false"
              v-wave
            >
              <span class="material-symbols-outlined"> close </span>
            </button>
          </div>
          <span v-else class="whitespace-pre"> {{ item.name }}</span>
        </td>
        <td>{{ !item.isFolder ? item.size : "" }}</td>
        <td>{{ !item.isFolder ? getItemExtension(item) : "Folder" }}</td>

        <!-- todo full extension name -->
        <td class="rounded-r-lg">{{ item.dateAdded.toLocaleDateString() }}</td>
      </tr>
    </tbody>
  </table>
</template>
