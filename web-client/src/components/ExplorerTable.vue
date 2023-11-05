<script setup lang="ts">
import { useDialogStore } from "@/stores/dialog";
import { useItemsStore, useSearchItemsStore } from "@/stores/items";
import { usePathStore } from "@/stores/path";
import { useSearchStore } from "@/stores/search";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { formatDate, formatSize } from "@/utils/format";
import { computed, inject, nextTick, ref, watch } from "vue";
import { useRouter } from "vue-router";

const isSearch = inject<boolean>("isSearch")!;
const itemsStore = isSearch ? useSearchItemsStore() : useItemsStore();
const router = useRouter();
const pathStore = usePathStore();
const selectionRectStore = useSelectionRectStore();
const dialogStore = useDialogStore();
const searchStore = useSearchStore();

const renameInput = ref<HTMLInputElement[] | null>(null);
let lastSelectedItemIdx = 0;

const itemsSorted = computed(() => {
  return itemsStore.items.sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.name.localeCompare(b.name);
  });
});

watch(
  () => pathStore.currentPath,
  () => (lastSelectedItemIdx = 0)
);
// autofocus attr on "renameInput" only works once so we need to watch for changes
watch(
  () => itemsStore.items.find((i) => i.isRenaming),
  async (item) => {
    if (!item) return;
    item.newName = item.name;
    renameInput.value![0].focus();
    await nextTick();
    renameInput.value![0].select();
  },
  { flush: "post" } // wait for DOM to update first
);

const handleItemSelect = (item: Item, e: MouseEvent | KeyboardEvent) => {
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
  if (item.isFolder) {
    router.push(`${item.path ? `/${item.path}` : ""}/${item.name}`);
    if (isSearch) searchStore.close();
  } else dialogStore.showError("This item cannot be previewed.");
};
const handleDragStart = (item: Item, e: DragEvent) => {
  if (selectionRectStore.isActive || item.isRenaming) return e.preventDefault();
  else selectionRectStore.isLeftMouseDown = false;
  e.dataTransfer?.setData("items", JSON.stringify(itemsStore.selectedItems));
  document.body.setAttribute("dragging-items", "true");
};
const handleDragStop = () => {
  document.body.removeAttribute("dragging-items");
};
const handleDrop = (item: Item, e: DragEvent) => {
  if (item.isFolder && !item.isSelected)
    itemsStore.handleDrop(e, `${item.path ? `${item.path}/` : ""}${item.name}`);
};
</script>

<template>
  <table class="dsy-table place-self-start">
    <caption class="sr-only">
      Explorer table
    </caption>
    <thead class="pointer-events-none">
      <th class="w-full sticky top-0 bg-base-100 z-10">Name</th>
      <th class="sticky top-0 bg-base-100 z-10">Size</th>
      <th class="sticky top-0 bg-base-100 z-10">Type</th>
      <th class="sticky top-0 bg-base-100 z-10">Date added</th>
      <th class="sticky top-0 bg-base-100 z-10">Date modified</th>
    </thead>
    <tbody>
      <tr
        v-for="item in itemsSorted"
        :key="item.id"
        :ref="(el) => item.el = el as HTMLElement"
        class="cursor-pointer hover:bg-base-200"
        :class="{
          '!bg-base-300': item.isSelected,
          'is-selected': item.isSelected,
          folder: item.isFolder,
        }"
        tabindex="0"
        :draggable="item.isSelected"
        @dragstart="handleDragStart(item, $event)"
        @dragend="handleDragStop"
        @drop.stop.prevent="handleDrop(item, $event)"
        @click.stop="handleItemSelect(item, $event)"
        @dblclick.stop="handleItemOpen(item)"
        @keyup.space.stop="handleItemSelect(item, $event)"
        @keyup.enter.stop="handleItemOpen(item)"
      >
        <td class="rounded-l-lg">
          <div class="flex items-center">
            <div
              class="fiv-viv text-xl mr-3 flex-shrink-0"
              :class="
                item.isFolder
                  ? 'fiv-icon-folder'
                  : `fiv-icon-blank fiv-icon-${item.type}`
              "
            ></div>
            <div
              v-if="item.isRenaming"
              class="inline-flex ml-2"
              @mousedown.stop="null"
              @click.stop="null"
            >
              <input
                ref="renameInput"
                v-model.trim="item.newName"
                type="text"
                :placeholder="`Enter a new ${
                  item.isFolder ? 'folder' : 'file'
                } name`"
                class="dsy-join-item dsy-input dsy-input-secondary outline-none"
                @keyup.enter.stop="itemsStore.renameItem(item)"
                @keyup.esc.stop="item.isRenaming = false"
                spellcheck="false"
                autocomplete="off"
              />
              <button
                class="dsy-join-item dsy-btn dsy-btn-secondary"
                :class="{ 'dsy-btn-disabled': !!item.newName }"
                @click.stop="itemsStore.renameItem(item)"
                v-wave
              >
                <span class="material-symbols-outlined"> check </span>
              </button>
              <button
                class="dsy-join-item dsy-btn dsy-btn-secondary"
                @click.stop="item.isRenaming = false"
                v-wave
              >
                <span class="material-symbols-outlined"> close </span>
              </button>
            </div>
            <div v-else>
              <div class="whitespace-pre">
                {{ item.name + (item.type ? `.${item.type}` : "") }}
              </div>
              <div v-if="isSearch" class="font-weight-bold">
                Path: Personal drive/{{ item.path }}
              </div>
            </div>
          </div>
        </td>
        <td class="whitespace-nowrap">
          {{ item.isFolder ? "" : formatSize(item.size!) }}
        </td>
        <td>{{ item.isFolder ? "Folder" : item.type.toUpperCase() }}</td>
        <td class="whitespace-nowrap">
          {{ formatDate(item.dateModified, "hr") }}
        </td>
        <td class="whitespace-nowrap rounded-r-lg">
          {{ formatDate(item.dateModified, "hr") }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
