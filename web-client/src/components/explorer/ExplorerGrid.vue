<script setup lang="ts">
import { useContextMenuStore } from "@/stores/context-menu";
import { useItemsStore } from "@/stores/items";
import { usePathStore } from "@/stores/path";
import { useSearchStore } from "@/stores/search";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { useSettingsStore } from "@/stores/settings";
import { useShortDialogStore } from "@/stores/short-dialog";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { CSSProperties, computed, inject, nextTick, ref, watch } from "vue";
import ExplorerGridHead from "./ExplorerGridHead.vue";
import ExplorerGridItems from "./ExplorerGridItems.vue";

const isSearch = inject<boolean>("isSearch")!;
const isThemeLight = inject<boolean>("isThemeLight")!;
const itemsStore = useItemsStore(isSearch);
const pathStore = usePathStore();
const selectionRectStore = useSelectionRectStore();
const dialogStore = useShortDialogStore();
const searchStore = useSearchStore();
const settingsStore = useSettingsStore();
const contextMenuStore = useContextMenuStore();

const columnSettings = computed(
  () => settingsStore.settings[isSearch ? "searchColumns" : "columns"],
);
const view = computed(() => settingsStore.settings.view);

const gridStyle = computed<CSSProperties>(() => ({
  gridTemplateColumns:
    view.value == "list"
      ? columnSettings.value.order
          .map((c) => (c == "name" ? "minmax(10rem, auto)" : "min-content"))
          .join(" ")
      : "repeat(auto-fill, minmax(10rem, 1fr))",
}));

const explBody = ref<HTMLElement | null>(null);
const rectEl = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const preventTransition = ref(false);
let lastSelectedItemIdx = 0;

watch(
  [
    () => columnSettings.value.orderBy,
    () => columnSettings.value.orderDesc,
    () => itemsStore.items,
  ],
  () => {
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
    nextTick(() => (preventTransition.value = false));
  },
  { immediate: true },
);
watch(
  () => pathStore.currentPath,
  () => {
    lastSelectedItemIdx = 0;
    preventTransition.value = true;
  },
  { flush: "pre" },
);

const handleItemContextMenu = (item: Item, e: MouseEvent) => {
  if (!item.isSelected) handleItemSelect(item, e);
  contextMenuStore.show("item", itemsStore, e);
};
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
};
const handleItemOpen = (item: Item) => {
  if (item.isFolder) {
    pathStore.pushOnTab(`${item.path}/${item.name}`);
    if (isSearch) searchStore.hide();
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
</script>

<template>
  <div
    class="grid min-h-0 w-full select-none overflow-x-auto"
    :class="{
      'grid-rows-1': view == 'grid',
      'grid-rows-[auto_1fr]': view == 'list',
    }"
    :style="gridStyle"
  >
    <ExplorerGridHead
      v-if="view == 'list'"
      :scroll-top="scrollTop"
      :items-store="itemsStore"
    />
    <div
      ref="explBody"
      class="expl-body relative col-span-full grid auto-rows-min grid-cols-[subgrid] overflow-y-scroll rounded-box"
      :class="{ 'items-start gap-x-4 gap-y-1': view == 'grid' }"
      @drop.stop.prevent="itemsStore.handleDrop"
      @dragover.stop.prevent="setDragOverStyle"
      @dragleave.stop.prevent="clearDragOverStyle"
      @dragend.stop.prevent="clearDragOverStyle"
      @mousedown.left="
        selectionRectStore.handleLeftMouseDown(
          explBody,
          rectEl,
          itemsStore.items,
          isSearch,
          $event,
        )
      "
      @scroll="scrollTop = explBody?.scrollTop ?? 0"
    >
      <TransitionGroup
        :name="
          !preventTransition
            ? view == 'list'
              ? 'expl-rows'
              : 'expl-items'
            : ''
        "
        :css="!preventTransition"
      >
        <a
          v-for="item in itemsStore.items"
          :key="item.id + isSearch.toString()"
          :ref="(el) => handleItemRef(item, el as HTMLElement)"
          :href="
            item.isFolder
              ? `${item.path ? `/${item.path}` : ''}/${item.name}`
              : undefined
          "
          class="expl-item cursor-pointer whitespace-nowrap rounded-box"
          :class="{
            folder: item.isFolder,
            'is-selected': item.isSelected,
            'col-span-full grid grid-cols-[subgrid]': view == 'list',
            'hover:bg-base-200': isThemeLight,
            'hover:bg-base-100/25': !isThemeLight,
            '!bg-base-300': isThemeLight && item.isSelected,
            '!bg-base-100/50': !isThemeLight && item.isSelected,
          }"
          tabindex="0"
          :draggable="item.isSelected"
          @dragstart="handleDragStart(item, $event)"
          @dragend="handleDragStop"
          @drop.stop.prevent="handleDropOnItem(item, $event)"
          @click.stop.prevent="handleItemSelect(item, $event)"
          @dblclick.stop.prevent="handleItemOpen(item)"
          @keyup.space.stop.prevent="handleItemSelect(item, $event)"
          @keyup.enter.stop.prevent="handleItemOpen(item)"
          @contextmenu.stop.prevent="handleItemContextMenu(item, $event)"
        >
          <div
            v-for="columnName in view == 'list'
              ? columnSettings.order
              : (['name'] as (keyof ItemCore)[])"
            :key="columnName"
            class="items-center"
            :class="{
              'is-renaming': item.isRenaming && columnName == 'name',
              'text-right': columnName == 'size',
              'flex min-w-0 gap-3': columnName == 'name',
              'flex-col text-center': view == 'grid',
            }"
          >
            <ExplorerGridItems
              :is-search="isSearch"
              :item="item"
              :items-store="itemsStore"
              :column-name="columnName"
              :view="view"
            />
          </div>
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
.expl-item > * {
  padding: 15px;
  align-self: center;
  &:not(.is-renaming) {
    pointer-events: none;
  }
}
body[dragging-items] .expl-item,
.expl-body.dragover .expl-item {
  &:not(.folder) {
    opacity: 0.25;
    transition: opacity 300ms;
  }
}
.expl-rows-enter-active,
.expl-rows-leave-active,
.expl-rows-enter-active ~ .expl-rows-move,
.expl-rows-leave-active ~ .expl-rows-move {
  transition:
    opacity 300ms,
    transform 300ms;
}
.expl-rows-enter-from {
  opacity: 0;
  transform: translateX(3rem);
}
.expl-rows-leave-active {
  display: none;
}
</style>
