<script setup lang="ts">
import { useItemsStore, useSearchItemsStore } from "@/stores/items/items";
import { usePathStore } from "@/stores/path";
import { useSearchStore } from "@/stores/search";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { useShortDialogStore } from "@/stores/short-dialog";
import { formatDate, formatSize } from "@/utils/format";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { computed, inject, nextTick, ref, watch } from "vue";

const isSearch = inject<boolean>("isSearch")!;
const itemsStore = isSearch ? useSearchItemsStore() : useItemsStore();
const pathStore = usePathStore();
const selectionRectStore = useSelectionRectStore();
const dialogStore = useShortDialogStore();
const searchStore = useSearchStore();

const explorerBody = ref<HTMLElement | null>(null);
const rectEl = ref<HTMLElement | null>(null);
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
  () => (lastSelectedItemIdx = 0),
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
  { flush: "post" }, // wait for DOM to update first
);

const handleItemSelect = (item: Item, e: MouseEvent | KeyboardEvent) => {
  if (e.ctrlKey) {
    if (item.isSelected) item.isSelected = false;
    else {
      item.isSelected = true;
      lastSelectedItemIdx = itemsSorted.value.indexOf(item);
    }
  } else if (e.shiftKey) {
    itemsStore.deselectAll();
    const start = Math.min(lastSelectedItemIdx, itemsSorted.value.indexOf(item));
    const end = Math.max(lastSelectedItemIdx, itemsSorted.value.indexOf(item));
    for (let i = start; i <= Math.min(end, itemsSorted.value.length - 1); i++)
      itemsSorted.value[i].isSelected = true;
  } else {
    itemsStore.deselectAll();
    item.isSelected = true;
    lastSelectedItemIdx = itemsSorted.value.indexOf(item);
  }
  if (!item.isRenaming) itemsStore.clearRenaming();
};
const handleItemOpen = (item: Item) => {
  if (item.isFolder) {
    pathStore.push(`${item.path ? `/${item.path}` : ""}/${item.name}`);
    if (isSearch) searchStore.close();
  } else dialogStore.showError("This item cannot be previewed."); // todo: add previews
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
const handleItemRef = (item: Item, el: HTMLElement) => {
  if (isSearch) item.searchEl = el;
  else item.el = el;
};
</script>

<template>
  <div
    class="expl-grid grid min-h-0 w-full select-none grid-cols-[auto_repeat(4,min-content)] grid-rows-[auto_1fr]"
  >
    <div
      class="expl-header pointer-events-none col-span-full grid grid-cols-[subgrid] bg-base-100 font-bold text-base-content/60"
    >
      <div>Name</div>
      <div>Size</div>
      <div>Type</div>
      <div>Date added</div>
      <div>Date modified</div>
    </div>
    <div
      ref="explorerBody"
      class="expl-body relative col-span-full grid auto-rows-min grid-cols-[subgrid] overflow-y-auto overflow-x-hidden rounded-l"
      @drop.stop.prevent="itemsStore.handleDrop"
      @dragover.stop.prevent="setDragOverStyle"
      @dragleave.stop.prevent="clearDragOverStyle"
      @dragend.stop.prevent="clearDragOverStyle"
      @mousedown.left="
        selectionRectStore.handleLeftMouseDown(
          explorerBody!,
          rectEl!,
          itemsStore.items,
          isSearch,
          $event,
        )
      "
    >
      <a
        v-for="item in itemsSorted"
        :key="item.id"
        :ref="(el) => handleItemRef(item, el as HTMLElement)"
        :href="
          item.isFolder
            ? `${item.path ? `/${item.path}` : ''}/${item.name}`
            : undefined
        "
        class="expl-row col-span-full grid cursor-pointer grid-cols-[subgrid] whitespace-nowrap rounded-l hover:bg-base-200"
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
        @click.stop.prevent="handleItemSelect(item, $event)"
        @dblclick.stop.prevent="handleItemOpen(item)"
        @keyup.space.stop.prevent="handleItemSelect(item, $event)"
        @keyup.enter.stop.prevent="handleItemOpen(item)"
      >
        <div class="flex min-w-0 items-center">
          <div
            class="fiv-viv mr-3 flex-shrink-0 text-xl"
            :class="
              item.isFolder
                ? 'fiv-icon-folder'
                : `fiv-icon-blank fiv-icon-${item.type}`
            "
          ></div>
          <div
            v-if="item.isRenaming"
            class="ml-2 inline-flex"
            @mousedown.stop="null"
            @click.stop.prevent="null"
          >
            <input
              ref="renameInput"
              v-model.trim="item.newName"
              type="text"
              :placeholder="`Enter a new ${
                item.isFolder ? 'folder' : 'file'
              } name`"
              class="dsy-input dsy-join-item dsy-input-secondary outline-none"
              @keyup.enter.stop="itemsStore.renameItem(item)"
              @keyup.esc.stop="item.isRenaming = false"
              spellcheck="false"
              autocomplete="off"
            />
            <button
              class="dsy-btn dsy-btn-secondary dsy-join-item"
              :class="{ 'dsy-btn-disabled': !item.newName }"
              @click="itemsStore.renameItem(item)"
              v-wave
            >
              <span class="material-symbols-outlined"> check </span>
            </button>
            <button
              class="dsy-btn dsy-btn-secondary dsy-join-item"
              @click="item.isRenaming = false"
              v-wave
            >
              <span class="material-symbols-outlined"> close </span>
            </button>
          </div>
          <template v-else>
            <div
              class="overflow-hidden text-ellipsis whitespace-pre"
              :class="{
                'whitespace-pre-wrap':
                  item.isSelected &&
                  itemsStore.selectedItems.length == 1 &&
                  !selectionRectStore.isActive,
              }"
            >
              {{ item.name + (item.type ? `.${item.type}` : "") }}
            </div>
            <div v-if="isSearch" class="font-weight-bold">
              Path: Personal drive/{{ item.path }}
            </div>
          </template>
        </div>
        <div>
          {{ item.isFolder ? "" : formatSize(item.size!) }}
        </div>
        <div>{{ item.isFolder ? "Folder" : item.type.toUpperCase() }}</div>
        <div>
          {{ formatDate(item.dateModified, "hr") }}
        </div>
        <div>
          {{ formatDate(item.dateModified, "hr") }}
        </div>
      </a>
      <div
        ref="rectEl"
        class="pointer-events-none absolute z-10 border border-primary bg-primary/20"
      ></div>
    </div>
  </div>
</template>

<style>
.expl-header > *,
.expl-row > * {
  padding: 15px;
  align-self: center;
}
/* [dragging-items] .expl-row:not(.folder) {
  pointer-events: none;
  opacity: 0.25;
} */
[dragging-items] .expl-row > * {
  pointer-events: none;
}
</style>
