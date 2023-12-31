<script setup lang="ts">
import ContextMenu from "@/components/ContextMenu.vue";
import Notification from "@/components/Notification.vue";
import ShortDialog from "@/components/ShortDialog.vue";
import Explorer from "@/components/explorer/Explorer.vue";
import ExplorerTabs from "@/components/explorer/ExplorerTabs.vue";
import Header from "@/components/header/Header.vue";
import { useContextMenuStore } from "@/stores/context-menu";
import { useClipboardStore } from "@/stores/items/clipboard";
import {
  ItemStore,
  focusedItemStoreId,
  getFocusedItemStore,
  getTopmostOpenItemStore,
  treeStoreDefs,
  useSearchItemStore,
} from "@/stores/items/manager";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { useSettingsStore } from "@/stores/settings";
import { useShortDialogStore } from "@/stores/short-dialog";
import { inEditable } from "@/utils";
import { onMounted, provide, ref } from "vue";

const searchItemStore = useSearchItemStore();
const selectionRectStore = useSelectionRectStore();
const dialogStore = useShortDialogStore();
const contextMenuStore = useContextMenuStore();
const settingsStore = useSettingsStore();
const clipboardStore = useClipboardStore();

const ghostDragDiv = ref<HTMLDivElement | null>();
provide("ghostDragDiv", ghostDragDiv);

onMounted(() => {
  document.addEventListener("mousemove", selectionRectStore.handleMouseMove);
  document.addEventListener("mouseup", selectionRectStore.handleMouseUp);
  document.addEventListener("touchmove", selectionRectStore.handleMouseMove);
  document.addEventListener("touchend", selectionRectStore.handleMouseUp);
  document.addEventListener("touchcancel", selectionRectStore.handleMouseUp);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("keyup", handleKeyUp);
});

const handleKeydown = (e: KeyboardEvent) => {
  const s = getFocusedItemStore();
  if (e.key == "Escape") handleEscape(s);
  else if (e.key == "Delete") handleDel(s);
  else if (e.key == "F2") handleF2(s, e);
  else if (e.ctrlKey && e.key == "a") handleCtrlA(s, e);
  else if (e.ctrlKey && e.key == "i") s.invertSelection();
  else if (e.ctrlKey && e.key == "c") clipboardStore.copy(s.selectedItems);
  else if (e.ctrlKey && e.key == "x") clipboardStore.cut(s.selectedItems);
  else if (e.ctrlKey && e.key == "v") clipboardStore.paste(s);
};
const handleKeyUp = (e: KeyboardEvent) => {
  if (e.key == "Enter" && dialogStore.state.isOpen) {
    if (dialogStore.state.handleConfirmation)
      dialogStore.state.handleConfirmation(true);
    dialogStore.close();
  }
};
const handleClickCapture = (e: MouseEvent) => {
  if (selectionRectStore.wasActive) {
    selectionRectStore.wasActive = false;
    return;
  }
  if (e.ctrlKey || e.shiftKey) return;
  const target = e.target as HTMLElement;
  const isInFileTree = !!target.closest("#filetree");
  if (isInFileTree)
    for (const treeStoreDef of Object.values(treeStoreDefs))
      treeStoreDef().deselectAll();
  const focusedItemStore = getFocusedItemStore();
  focusedItemStore.deselectAll();
};
const handleMouseDown = () => {
  focusedItemStoreId.value = "items";
};
const handleMouseDownCapture = (e: MouseEvent | TouchEvent) => {
  const target = e.target as HTMLElement;
  const focusedItemStore = getFocusedItemStore();
  const isInRenameContainer = !!target.closest("#rename-container");
  if (!isInRenameContainer) focusedItemStore.stopRenaming();
  if (!searchItemStore.items.length && !target.closest("#search"))
    searchItemStore.isOpen = false;
  contextMenuStore.hide();
};
const handleEscape = (focusedItemStore: ItemStore) => {
  if (focusedItemStore.selectedItems.length) {
    clipboardStore.empty();
    focusedItemStore.deselectAll();
    return;
  }
  const openItemStore = getTopmostOpenItemStore();
  if (openItemStore) {
    openItemStore.isOpen = false;
    focusedItemStoreId.value = getTopmostOpenItemStore()?.$id ?? "items";
  } else focusedItemStoreId.value = "items";
};
const handleDel = (focusedItemStore: ItemStore) => {
  if (focusedItemStore.selectedItems.length) focusedItemStore.deleteItems();
};
const handleF2 = (focusedItemStore: ItemStore, e: KeyboardEvent) => {
  if (focusedItemStore.selectedItems.length != 1) return;
  e.preventDefault();
  focusedItemStore.selectedItems[0].isRenaming = true;
};
const handleCtrlA = (focusedItemStore: ItemStore, e: KeyboardEvent) => {
  if (inEditable()) return;
  e.preventDefault();
  document.body.style.userSelect = "none";
  focusedItemStore.selectAll();
  document.body.style.userSelect = "";
};
</script>

<template>
  <div
    id="home"
    class="flex flex-col"
    :class="{ 'not-ready': !settingsStore.dbSettingsReady }"
    @click.capture="handleClickCapture"
    @mousedown="handleMouseDown"
    @mousedown.capture="handleMouseDownCapture"
    @touchstart="handleMouseDown"
    @touchstart.capture="handleMouseDownCapture"
    @contextmenu="contextMenuStore.hide()"
  >
    <Header id="header" />
    <div
      id="window"
      class="flex min-h-0 flex-1 flex-col overflow-clip bg-base-100"
    >
      <ExplorerTabs />
      <Explorer />
      <ShortDialog />
      <ContextMenu />
      <Notification />
      <div
        ref="ghostDragDiv"
        class="fixed -top-full rounded-box bg-base-300 p-3 pl-7"
      ></div>
    </div>
  </div>
</template>

<style>
#home {
  perspective: 80vw;
  &.not-ready {
    & > #header {
      transform: translateY(-100%);
      opacity: 0;
    }
    & > #window {
      box-shadow: 0 0 50vw -5rem oklch(var(--bc));
      transform: rotate3d(0, 1, 0, 30deg) scale(0.9) translate(10vw, -5vh);
      filter: grayscale(1);
      @screen lg {
        transform: rotate3d(0, 1, 0, 30deg) scale(0.7) translate(10vw, -5vh);
      }
    }
  }
}
#header,
#window {
  transition-property: transform, opacity, filter;
  transition-duration: 1s;
}
</style>
