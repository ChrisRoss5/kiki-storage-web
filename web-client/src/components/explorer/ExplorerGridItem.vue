<script setup lang="ts">
import { useContextMenuStore } from "@/stores/context-menu";
import { ItemStore } from "@/stores/items/manager";
import { usePathStore } from "@/stores/path";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { useShortDialogStore } from "@/stores/short-dialog";
import { formatDate, formatSize } from "@/utils/format";
import { getFullPath } from "@/utils/item";
import { Ref, inject } from "vue";
import ExplorerGridItemName from "./ExplorerGridItemName.vue";
import ExpandButton from "./filetree/ExpandButton.vue";
import FolderOptions from "./filetree/FolderOptions.vue";

const isFileTree = inject<boolean>("isFileTree")!;
const isSearch = inject<boolean>("isSearch")!;
const isThemeLight = inject<boolean>("isThemeLight")!;
const ghostDragDiv = inject<Ref<HTMLDivElement | null>>("ghostDragDiv")!;

const props = defineProps<{
  item: Item;
  itemStore: ItemStore;
  view: ExplorerView;
  columnOrder: Partial<keyof ItemCore>[];
  lastSelectedItemIdx: number;
  handleDropOnBody: (e: DragEvent) => void;
}>();

const emit = defineEmits<{
  (e: "update:lastSelectedItemIdx", value: number): void;
}>();

const pathStore = usePathStore();
const contextMenuStore = useContextMenuStore();
const dialogStore = useShortDialogStore();
const selectionRectStore = useSelectionRectStore();

const handleItemContextMenu = (item: Item, e: MouseEvent) => {
  if (!item.isSelected) handleItemSelect(item, e);
  contextMenuStore.show("item", props.itemStore, e);
};
const handleItemSelect = (item: Item, e: MouseEvent | KeyboardEvent) => {
  const idx = props.itemStore.items.indexOf(item);
  if (e.ctrlKey) {
    if (!item.isSelected) emit("update:lastSelectedItemIdx", idx);
    item.isSelected = !item.isSelected;
  } else if (e.shiftKey) {
    props.itemStore.deselectAll();
    const start = Math.min(props.lastSelectedItemIdx, idx);
    const end = Math.max(props.lastSelectedItemIdx, idx);
    for (
      let i = start;
      i <= Math.min(end, props.itemStore.items.length - 1);
      i++
    )
      props.itemStore.items[i].isSelected = true;
  } else {
    if (!item.isSelected) {
      props.itemStore.deselectAll();
      emit("update:lastSelectedItemIdx", idx);
    }
    item.isSelected = !item.isSelected;
  }
};
const handleItemOpen = (item: Item) => {
  if (item.isFolder) {
    pathStore.pushOnTab(`${item.path}/${item.name}`);
    if (props.itemStore.$id != "items") props.itemStore.isOpen = false;
  } else dialogStore.showError("This item cannot be previewed."); // Todo: add previews
};
const handleDragStart = (item: Item, e: DragEvent) => {
  if (selectionRectStore.isActive || item.isRenaming || !item.isSelected)
    return e.preventDefault();
  else selectionRectStore.isLeftMouseDown = false;
  const count = props.itemStore.selectedItems.length;
  const dragData = JSON.stringify(props.itemStore.selectedItems);
  if (count > 1) {
    ghostDragDiv.value!.textContent = `moving ${count} items`;
    e.dataTransfer?.setDragImage(ghostDragDiv.value!, 0, 0);
  }
  e.dataTransfer?.setData("items", dragData);
  if (!isSearch) document.body.setAttribute("dragging-items", props.item.path);
};
const handleDragStop = () => {
  document.body.removeAttribute("dragging-items");
};
const handleDropOnItem = (item: Item, e: DragEvent) => {
  if (item.isFolder && !item.isSelected)
    props.itemStore.handleDrop(e, getFullPath(item));
  else props.handleDropOnBody(e);
};
</script>

<template>
  <a
    :id="item.id"
    :href="item.isFolder ? `/${getFullPath(item)}` : undefined"
    class="expl-item"
    :class="{
      ['is-' + view]: true,
      folder: item.isFolder,
      'is-selected': item.isSelected,
      'col-span-full grid grid-cols-[subgrid]': view == 'list' && !isFileTree,
      'group flex': isFileTree,
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
    @keydown.space.stop.prevent="handleItemSelect(item, $event)"
    @keyup.enter.stop.prevent="handleItemOpen(item)"
    @contextmenu.stop.prevent="handleItemContextMenu(item, $event)"
  >
    <ExpandButton
      v-if="isFileTree && item.isFolder"
      :path="getFullPath(item)"
    />
    <div
      v-for="columnName in columnOrder"
      :key="columnName"
      :class="{
        '!pointer-events-auto': item.isRenaming && columnName == 'name',
        'text-right': columnName == 'size',
        'flex min-w-0 items-center gap-3': columnName == 'name',
        'flex-col text-center': view == 'grid',
      }"
    >
      <ExplorerGridItemName
        v-if="columnName == 'name'"
        :item="item"
        :item-store="itemStore"
        :view="view"
      />
      <template v-else-if="columnName == 'size'">
        {{ item.isFolder ? "" : formatSize(item.size) }}
      </template>
      <template v-else-if="columnName == 'type'">
        {{ item.isFolder ? "Folder" : item.type.toUpperCase() }}
      </template>
      <template v-else-if="columnName == 'dateAdded'">
        {{ formatDate(item.dateAdded) }}
      </template>
      <template v-else-if="columnName == 'dateModified'">
        {{ formatDate(item.dateModified) }}
      </template>
    </div>
    <FolderOptions
      v-if="isFileTree && item.isFolder"
      :path="getFullPath(item)"
    />
  </a>
</template>
