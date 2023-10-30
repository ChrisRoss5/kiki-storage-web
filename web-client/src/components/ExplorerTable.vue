<script setup lang="ts">
import { useItemsStore } from "@/stores/items";
import { usePathStore } from "@/stores/path";
import { nextTick, ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const itemsStore = useItemsStore();
const pathStore = usePathStore();

const renameInput = ref<HTMLInputElement[] | null>(null);
const newItemName = ref("");
let lastSelectedItemIdx = 0;

watch(
  () => pathStore.currentPath,
  () => (lastSelectedItemIdx = 0)
);
// autofocus attr on "renameInput" weirdly only works once so we need to watch for changes
watch(
  () => itemsStore.items.find((i) => i.isRenaming),
  async (item) => {
    if (!item) return;
    newItemName.value = item.name;
    renameInput.value![0].focus();
    await nextTick();
    renameInput.value![0].select();
  },
  { flush: "post" } // wait for DOM to update first
);

const getItemExtension = (item: Item) => {
  const split = item.name.split(".");
  return split.length > 1 ? split.at(-1) : "";
};
const handleRowSelect = (item: Item, e: MouseEvent | KeyboardEvent) => {
  if (e.ctrlKey) {
    if (item.isSelected) item.isSelected = false;
    else {
      item.isSelected = true;
      lastSelectedItemIdx = itemsStore.items.indexOf(item);
    }
  } else if (e.shiftKey) {
    itemsStore.deselectAll();
    const start = Math.min(lastSelectedItemIdx, itemsStore.items.indexOf(item));
    const end = Math.max(lastSelectedItemIdx, itemsStore.items.indexOf(item));
    for (let i = start; i <= Math.min(end, itemsStore.items.length - 1); i++)
      itemsStore.items[i].isSelected = true;
  } else {
    itemsStore.deselectAll();
    item.isSelected = true;
    lastSelectedItemIdx = itemsStore.items.indexOf(item);
  }
  if (!item.isRenaming) itemsStore.clearRenaming();
};
const handleItemOpen = (item: Item) => {
  if (item.isFolder)
    router.push(`${item.path ? `/${item.path}` : ""}/${item.name}`);
  else console.log("open file");
};
const handleDragStart = (item: Item, e: DragEvent) => {
  item.isSelected = itemsStore.dragging = true;
  e.dataTransfer?.setData("items", JSON.stringify(itemsStore.selectedItems));
  document.body.setAttribute("dragging-items", "true");
};
const handleDragStop = () => {
  document.body.removeAttribute("dragging-items");
};
</script>

<template>
  <table class="dsy-table place-self-start select-none">
    <caption class="sr-only">
      Explorer table
    </caption>
    <thead class="pointer-events-none">
      <th class="w-full sticky top-0 bg-base-100 z-10">Name</th>
      <th class="sticky top-0 bg-base-100 z-10">Size</th>
      <th class="sticky top-0 bg-base-100 z-10">Type</th>
      <th class="sticky top-0 bg-base-100 z-10">Date added</th>
    </thead>
    <tbody>
      <tr
        v-for="item in itemsStore.items"
        :key="item.name + item.path + item.isFolder"
        class="cursor-pointer hover:bg-base-200"
        :class="{
          '!bg-base-300': item.isSelected,
          folder: item.isFolder,
          'pointer-events-none':
            false && itemsStore.dragging && item.isSelected, // todo
        }"
        tabindex="0"
        draggable="true"
        @dragstart="handleDragStart(item, $event)"
        @dragend="handleDragStop"
        @drop.stop.prevent="
          itemsStore.handleDrop($event, `${item.path}/${item.name}`)
        "
        @click.stop="handleRowSelect(item, $event)"
        @dblclick.stop="handleItemOpen(item)"
        @keyup.space="handleRowSelect(item, $event)"
        @keyup.enter="handleItemOpen(item)"
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
              ref="renameInput"
              v-model.trim="newItemName"
              type="text"
              :placeholder="`Enter a new ${
                item.isFolder ? 'folder' : 'file'
              } name`"
              class="dsy-join-item dsy-input dsy-input-secondary outline-none"
              @keyup.stop.enter="itemsStore.renameItem(item, newItemName)"
              @keyup.stop.esc="item.isRenaming = false"
            />
            <button
              class="dsy-join-item dsy-btn dsy-btn-secondary"
              :class="{
                'dsy-btn-disabled': !newItemName || newItemName == item.name,
              }"
              @click="itemsStore.renameItem(item, newItemName)"
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