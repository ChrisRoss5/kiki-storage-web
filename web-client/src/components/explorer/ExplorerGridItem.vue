<script setup lang="ts">
import { useContextMenuStore } from "@/stores/context-menu";
import { ItemStore } from "@/stores/items/manager";
import { usePathStore } from "@/stores/path";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { useShortDialogStore } from "@/stores/short-dialog";
import { useTabsStore } from "@/stores/tabs";
import { formatDate, formatSize } from "@/utils/format";
import { getFullPath } from "@/utils/item";
import { useSwipe } from "@vueuse/core";
import { Ref, inject, ref, watch } from "vue";
import { useCurrentUser } from "vuefire";
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
const user = useCurrentUser();
const tabsStore = useTabsStore();

const itemAnchor = ref<HTMLAnchorElement | null>(null);
if (isFileTree && props.item.isFolder) {
  const { isSwiping, direction } = useSwipe(itemAnchor);
  watch(isSwiping, (isSwiping) => {
    if (isSwiping && direction.value == "right") handleItemOpen(props.item);
  });
}

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
  else selectionRectStore.deactivate();
  const { selectedItems: items } = props.itemStore;
  const dragData: ItemsDragData = { items, uid: user.value?.uid };
  if (items.length > 1) {
    ghostDragDiv.value!.textContent = `moving ${items.length} items`;
    e.dataTransfer?.setDragImage(ghostDragDiv.value!, 0, 0);
  }
  e.dataTransfer?.setData("ItemsDragData", JSON.stringify(dragData));
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
    ref="itemAnchor"
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
      'is-cut': item.isCut,
    }"
    tabindex="0"
    :draggable="!$isTouchDevice && item.isSelected"
    @dragstart="!$isTouchDevice && handleDragStart(item, $event)"
    @dragend="!$isTouchDevice && handleDragStop()"
    @drop.stop.prevent="handleDropOnItem(item, $event)"
    @click.stop.prevent="
      $isTouchDevice
        ? isFileTree && item.isFolder
          ? (
              ($event.target as HTMLElement).firstElementChild as HTMLElement
            ).click()
          : handleItemOpen(item)
        : handleItemSelect(item, $event)
    "
    @dblclick.stop.prevent="handleItemOpen(item)"
    @auxclick.middle.stop.prevent="
      item.isFolder && tabsStore.createTab(getFullPath(item))
    "
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

<style>
.is-cut {
  filter: brightness(0.6);
}
</style>
