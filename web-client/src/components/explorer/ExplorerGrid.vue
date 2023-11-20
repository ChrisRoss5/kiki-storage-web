<script setup lang="ts">
import { useItemsStore, useSearchItemsStore } from "@/stores/items";
import { usePathStore } from "@/stores/path";
import { useSearchStore } from "@/stores/search";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { useSettingsStore } from "@/stores/settings";
import { useShortDialogStore } from "@/stores/short-dialog";
import { formatDate, formatSize } from "@/utils/format";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import {
  CSSProperties,
  computed,
  inject,
  nextTick,
  ref,
  watch,
  watchEffect,
} from "vue";
import { DragHandle, SlickItem, SlickList } from "vue-slicksort";

const isSearch = inject<boolean>("isSearch")!;
const itemsStore = isSearch ? useSearchItemsStore() : useItemsStore();
const pathStore = usePathStore();
const selectionRectStore = useSelectionRectStore();
const dialogStore = useShortDialogStore();
const searchStore = useSearchStore();
const settingsStore = useSettingsStore();

const columnSettings = computed(
  () => settingsStore.settings[isSearch ? "searchColumns" : "columns"],
);
let savingNewColumnOrder = false;
const columnOrder = computed({
  get: () => columnSettings.value.order,
  async set(newValue) {
    if (savingNewColumnOrder) return;
    savingNewColumnOrder = true;
    await settingsStore.updateColumns({ order: newValue });
    savingNewColumnOrder = false;
  },
});
const gridStyle = computed<CSSProperties>(() => ({
  gridTemplateColumns: columnSettings.value.order
    .map((c) => (c == "name" ? "auto" : "min-content"))
    .join(" "),
}));

const explorerBody = ref<HTMLElement | null>(null);
const rectEl = ref<HTMLElement | null>(null);
const renameInput = ref<HTMLInputElement[] | null>(null);

const explorerBodyTransitionName = ref("explorer-body");
const isDraggingColumn = ref(false);
const scrollTop = ref(0);

const columns: Partial<Record<keyof ItemCore, string>> = {
  name: "Name",
  size: "Size",
  type: "Type",
  dateAdded: "Date added",
  dateModified: "Date modified",
};
let lastSelectedItemIdx = 0;

watchEffect(() => {
  const { orderBy, orderDesc } = columnSettings.value;
  itemsStore.items.sort((a, b) => {
    const desc = orderDesc ? -1 : 1;
    if (a.isFolder && !b.isFolder) return -desc;
    if (!a.isFolder && b.isFolder) return desc;
    if (orderBy == "size") {
      if (!a.size || !b.size) return a.name.localeCompare(b.name) * desc;
      return (a.size - b.size) * desc;
    }
    if (orderBy == "dateAdded" || orderBy == "dateModified")
      return (a[orderBy].getTime() - b[orderBy].getTime()) * desc;
    return (a[orderBy] as string).localeCompare(b[orderBy] as string) * desc;
  });
  nextTick(() => {
    explorerBodyTransitionName.value = "explorer-body";
  });
});
watch(
  () => pathStore.currentPath,
  () => {
    lastSelectedItemIdx = 0;
    explorerBodyTransitionName.value = "";
  },
  { flush: "pre" },
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
    pathStore.push(`${item.path ? `/${item.path}` : ""}/${item.name}`);
    if (isSearch) searchStore.close();
  } else dialogStore.showError("This item cannot be previewed."); // todo: add previews
};
const handleDragStart = (item: Item, e: DragEvent) => {
  if (selectionRectStore.isActive || item.isRenaming || !item.isSelected)
    return e.preventDefault();
  else selectionRectStore.isLeftMouseDown = false;
  e.dataTransfer?.setData("items", JSON.stringify(itemsStore.selectedItems));
  document.body.setAttribute("dragging-items", "true");
};
const handleDragStop = () => {
  document.body.removeAttribute("dragging-items");
};
const handleDropOnItem = (item: Item, e: DragEvent) => {
  if (item.isFolder && !item.isSelected)
    itemsStore.handleDrop(e, `${item.path ? `${item.path}/` : ""}${item.name}`);
};
const handleItemRef = (item: Item, el: HTMLElement) => {
  if (isSearch) item.searchEl = el;
  else item.el = el;
};
const handleColumnClick = (key: keyof ItemCore) => {
  if (columnSettings.value.orderBy == key)
    settingsStore.updateColumns({
      orderDesc: !columnSettings.value.orderDesc,
    });
  else
    settingsStore.updateColumns({
      orderBy: key,
      orderDesc: key == "dateAdded" || key == "dateModified",
    });
};
</script>

<template>
  <div
    class="expl-grid grid min-h-0 w-full select-none grid-rows-[auto_1fr]"
    :style="gridStyle"
  >
    <SlickList
      class="expl-header duration-300] z-[1] col-span-full grid grid-cols-[subgrid] items-center rounded-xl bg-base-100 transition-[box-shadow]"
      :class="{
        'pointer-events-none': isDraggingColumn,
        'shadow-md': scrollTop > 0,
      }"
      v-model:list="columnOrder"
      axis="x"
      lockAxis="x"
      useDragHandle
      helperClass="slick-item-dragging"
      @sort-start="isDraggingColumn = true"
      @sort-end="isDraggingColumn = false"
    >
      <SlickItem
        v-for="(key, i) in columnOrder"
        :key="key"
        :index="i"
        class="group relative z-[2] cursor-pointer rounded-xl bg-base-100 p-3 font-bold text-base-content/60 hover:bg-base-200"
        @click.stop="handleColumnClick(key)"
      >
        <DragHandle
          class="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 cursor-grab opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          drag_indicator
        </DragHandle>
        <div
          v-if="columnSettings.orderBy == key"
          class="material-symbols-outlined absolute -top-2 left-1/2 -translate-x-1/2 transition-transform duration-300"
          :class="{ 'scale-y-[-1]': !columnSettings.orderDesc }"
        >
          expand_more
        </div>
        <div
          class="col-name transition-transform duration-300 group-hover:translate-x-3"
        >
          {{ columns[key] }}
        </div>
      </SlickItem>
    </SlickList>
    <div
      ref="explorerBody"
      class="expl-body relative col-span-full grid auto-rows-min grid-cols-[subgrid] overflow-y-scroll overflow-x-hidden rounded-xl"
      @drop.stop.prevent="itemsStore.handleDrop"
      @dragover.stop.prevent="setDragOverStyle"
      @dragleave.stop.prevent="clearDragOverStyle"
      @dragend.stop.prevent="clearDragOverStyle"
      @mousedown.left="
        selectionRectStore.handleLeftMouseDown(
          explorerBody,
          rectEl,
          itemsStore.items,
          isSearch,
          $event,
        )
      "
      @scroll="scrollTop = explorerBody?.scrollTop ?? 0"
    >
      <TransitionGroup
        :name="explorerBodyTransitionName"
        :css="!!explorerBodyTransitionName"
      >
        <a
          v-for="item in itemsStore.items"
          :key="item.id"
          :ref="(el) => handleItemRef(item, el as HTMLElement)"
          :href="
            item.isFolder
              ? `${item.path ? `/${item.path}` : ''}/${item.name}`
              : undefined
          "
          class="expl-row col-span-full grid cursor-pointer grid-cols-[subgrid] whitespace-nowrap rounded-xl bg-base-100 hover:bg-base-200"
          :class="{ 'is-selected folder !bg-base-300': item.isSelected }"
          tabindex="0"
          :draggable="item.isSelected"
          @dragstart="handleDragStart(item, $event)"
          @dragend="handleDragStop"
          @drop.stop.prevent="handleDropOnItem(item, $event)"
          @click.stop.prevent="handleItemSelect(item, $event)"
          @dblclick.stop.prevent="handleItemOpen(item)"
          @keyup.space.stop.prevent="handleItemSelect(item, $event)"
          @keyup.enter.stop.prevent="handleItemOpen(item)"
        >
          <TransitionGroup>
            <div
              v-for="columnName in columnSettings.order"
              :key="columnName"
              class="expl-col items-center transition-transform duration-300"
              :class="{
                'text-right': columnName == 'size',
                'flex min-w-0': columnName == 'name',
              }"
            >
              <template v-if="columnName == 'name'">
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
                    @keydown.esc.stop="item.isRenaming = false"
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
                <div class="overflow-hidden" v-else>
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
                  <div
                    class="font-weight-bold overflow-hidden text-ellipsis"
                    v-if="isSearch"
                  >
                    Path: Personal drive/{{ item.path }}
                  </div>
                </div>
              </template>
              <template v-else-if="columnName == 'size'">
                {{ item.isFolder ? "" : formatSize(item.size!) }}
              </template>
              <template v-else-if="columnName == 'type'">
                {{ item.isFolder ? "Folder" : item.type.toUpperCase() }}
              </template>
              <template v-else-if="columnName == 'dateAdded'">
                {{ formatDate(item.dateAdded, "hr") }}
              </template>
              <template v-else-if="columnName == 'dateModified'">
                {{ formatDate(item.dateModified, "hr") }}
              </template>
            </div>
          </TransitionGroup>
        </a>
      </TransitionGroup>
      <div
        ref="rectEl"
        class="pointer-events-none absolute z-10 border border-primary bg-primary/20"
      ></div>
    </div>
  </div>
</template>

<style>
.slick-item-dragging {
  @apply cursor-grabbing bg-base-200;
  & .material-symbols-outlined {
    opacity: 1;
  }
  & .col-name {
    @apply translate-x-3;
  }
}

.expl-row > * {
  padding: 15px;
  align-self: center;
}
.expl-row,
.expl-col {
  transition:
    opacity 300ms,
    transform 300ms;
}
[dragging-items] .expl-row:not(.folder) {
  /* pointer-events: none; */
  opacity: 0.25;
}
[dragging-items] .expl-row > * {
  pointer-events: none;
}
.explorer-body-enter-from {
  opacity: 0;
  transform: translateX(3rem);
}
.explorer-body-leave-active {
  opacity: 0;
  position: absolute;
  transition: transform 300ms;
}
</style>
