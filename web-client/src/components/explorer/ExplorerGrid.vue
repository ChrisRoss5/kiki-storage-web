<script setup lang="ts">
import { useContextMenuStore } from "@/stores/context-menu";
import { ItemsStore } from "@/stores/items";
import { useItemsFirestoreStore } from "@/stores/items/firestore";
import { usePathStore } from "@/stores/path";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { useSettingsStore } from "@/stores/settings";
import { useShortDialogStore } from "@/stores/short-dialog";
import { useTabsStore } from "@/stores/tabs";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { CSSProperties, computed, inject, nextTick, ref, watch } from "vue";
import ExplorerGridHead from "./ExplorerGridHead.vue";
import ExplorerGridItems from "./ExplorerGridItems.vue";
import LoaderIcon from "./LoaderIcon.vue";
import ExpandButton from "./filetree/ExpandButton.vue";
import FileTreeGrid from "./filetree/FileTreeGrid.vue";

const props = defineProps<{
  itemsStore: ItemsStore;
  path: string;
}>();

const isFileTree = inject<boolean>("isFileTree")!;
const isSearch = inject<boolean>("isSearch")!;
const isThemeLight = inject<boolean>("isThemeLight")!;
const pathStore = usePathStore();
const tabsStore = useTabsStore();
const selectionRectStore = useSelectionRectStore();
const dialogStore = useShortDialogStore();
const settingsStore = useSettingsStore();
const contextMenuStore = useContextMenuStore();
const { api: firestoreApi } = useItemsFirestoreStore();

if (isFileTree) {
  console.log(props.path);
  props.itemsStore.setDbItems(firestoreApi.getItems(props.path));
}

const columnSettings = computed(
  () => settingsStore.settings[isSearch ? "searchColumns" : "columns"],
);
const view = computed<ExplorerView>(() =>
  isFileTree ? "list" : settingsStore.settings.view,
);
const gridStyle = computed<CSSProperties>(() => ({
  gridTemplateColumns:
    view.value == "list" || isFileTree
      ? isFileTree
        ? "1.5rem 1fr"
        : columnSettings.value.order
            .map((c) => (c == "name" ? "minmax(10rem, auto)" : "min-content"))
            .join(" ")
      : "repeat(auto-fill, minmax(5rem, 1fr))",
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
    () => props.itemsStore.items,
  ],
  () => {
    const { orderBy, orderDesc } = columnSettings.value;
    props.itemsStore.items.sort((a, b) => {
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
  () => props.path,
  () => {
    lastSelectedItemIdx = 0;
    preventTransition.value = true;
  },
  { flush: "pre" },
);

const handleItemContextMenu = (item: Item, e: MouseEvent) => {
  if (!item.isSelected) handleItemSelect(item, e);
  contextMenuStore.show("item", props.itemsStore, e);
};
const handleItemSelect = (item: Item, e: MouseEvent | KeyboardEvent) => {
  const idx = props.itemsStore.items.indexOf(item);
  if (e.ctrlKey) {
    if (item.isSelected) item.isSelected = false;
    else {
      item.isSelected = true;
      lastSelectedItemIdx = idx;
    }
  } else if (e.shiftKey) {
    props.itemsStore.deselectAll();
    const start = Math.min(lastSelectedItemIdx, idx);
    const end = Math.max(lastSelectedItemIdx, idx);
    for (
      let i = start;
      i <= Math.min(end, props.itemsStore.items.length - 1);
      i++
    )
      props.itemsStore.items[i].isSelected = true;
  } else {
    props.itemsStore.deselectAll();
    item.isSelected = true;
    lastSelectedItemIdx = idx;
  }
};
const handleItemOpen = (item: Item) => {
  if (item.isFolder) {
    pathStore.pushOnTab(`${item.path}/${item.name}`);
    if (props.itemsStore.$id != "items") props.itemsStore.isOpen = false;
  } else dialogStore.showError("This item cannot be previewed."); // Todo: add previews
};
const handleDragStart = (item: Item, e: DragEvent) => {
  if (selectionRectStore.isActive || item.isRenaming || !item.isSelected)
    return e.preventDefault();
  else selectionRectStore.isLeftMouseDown = false;
  e.dataTransfer?.setData(
    "items",
    JSON.stringify(props.itemsStore.selectedItems),
  );
  document.body.setAttribute("dragging-items", props.path);
};
const handleDragStop = () => {
  document.body.removeAttribute("dragging-items");
};
const handleDropOnItem = (item: Item, e: DragEvent) => {
  const itemFullPath = `${item.path ? `${item.path}/` : ""}${item.name}`;
  if (item.isFolder && !item.isSelected)
    props.itemsStore.handleDrop(e, itemFullPath);
  else if (
    document.body.getAttribute("dragging-items") != props.path &&
    !isSearch
  )
    props.itemsStore.handleDrop(e, props.path);
};
</script>

<template>
  <div
    class="grid select-none overflow-x-auto"
    :class="{
      'grid-rows-1': view == 'grid',
      'grid-rows-[auto_1fr]': view == 'list',
      '!overflow-hidden': isFileTree,
    }"
    :style="gridStyle"
  >
    <LoaderIcon v-if="isFileTree" :loading="itemsStore.itemsPending" />
    <ExplorerGridHead
      v-if="view == 'list' && !isFileTree"
      :scroll-top="scrollTop"
      :items-store="itemsStore"
    />
    <div
      ref="explBody"
      class="expl-body relative col-span-full grid auto-rows-min grid-cols-[subgrid] overflow-y-scroll rounded-box"
      :class="{
        'items-start gap-x-2 gap-y-1': view == 'grid',
        '!overflow-hidden': isFileTree,
      }"
      :path="props.path"
      @drop.stop.prevent="itemsStore.handleDrop($event, props.path)"
      @dragover.stop.prevent="setDragOverStyle"
      @dragleave.stop.prevent="clearDragOverStyle"
      @dragend.stop.prevent="clearDragOverStyle"
      @mousedown.left.stop="
        selectionRectStore.handleLeftMouseDown(
          explBody,
          rectEl,
          itemsStore.items,
          isFileTree,
          $event,
        )
      "
      @scroll="scrollTop = explBody?.scrollTop ?? 0"
    >
      <TransitionGroup
        :name="!preventTransition ? 'rows' : ''"
        :css="!preventTransition"
      >
        <template v-for="item in itemsStore.items" :key="item.id">
          <a
            :id="item.id"
            :href="
              item.isFolder
                ? `${item.path ? `/${item.path}` : ''}/${item.name}`
                : undefined
            "
            class="expl-item expl-grid-item"
            :class="{
              ['is-' + view]: true,
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
            <ExpandButton
              v-if="isFileTree && item.isFolder"
              :path="`${item.path ? `${item.path}/` : ''}${item.name}`"
            />
            <div
              v-for="columnName in view == 'list' && !isFileTree
                ? columnSettings.order
                : (['name'] satisfies (keyof ItemCore)[])"
              :key="columnName"
              :class="{
                '!pointer-events-auto': item.isRenaming && columnName == 'name',
                'text-right': columnName == 'size',
                'flex min-w-0 items-center gap-3': columnName == 'name',
                'flex-col text-center': view == 'grid',
              }"
              :style="{ 'grid-column': isFileTree ? 2 : undefined }"
            >
              <ExplorerGridItems
                :item="item"
                :items-store="itemsStore"
                :column-name="columnName"
                :view="view"
              />
            </div>
          </a>
          <FileTreeGrid
            v-if="
              isFileTree &&
              item.isFolder &&
              tabsStore.activeTab.expandedPaths?.includes(
                `${item.path ? `${item.path}/` : ''}${item.name}`,
              )
            "
            :path="`${item.path ? `${item.path}/` : ''}${item.name}`"
          />
        </template>
      </TransitionGroup>
      <div
        ref="rectEl"
        class="pointer-events-none absolute z-10 border border-primary bg-primary/20"
      ></div>
    </div>
  </div>
</template>

<style>
.expl-grid-item {
  @apply relative cursor-pointer items-center whitespace-nowrap rounded-box;
  & > * {
    pointer-events: none;
  }
  &.is-list > * {
    @apply p-3;
  }
  &.is-grid > * {
    @apply px-1 py-2;
  }
}
body[dragging-items] .expl-item,
.expl-body.dragover .expl-item {
  &:not(.folder) {
    opacity: 0.25;
    transition: opacity 300ms;
  }
}
</style>
