<script setup lang="ts">
import Explorer from "@/components/explorer/Explorer.vue";
import ExplorerTabs from "@/components/explorer/ExplorerTabs.vue";
import Header from "@/components/header/Header.vue";
import { useContextMenuStore } from "@/stores/context-menu";
import {
  focusedItemStoreId,
  getFocusedItemStore,
  getTopmostOpenItemStore,
  treeStoreDefs,
  useSearchItemStore,
} from "@/stores/items/manager";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { useSettingsStore } from "@/stores/settings";
import { useShortDialogStore } from "@/stores/short-dialog";
import { onMounted } from "vue";

const searchItemStore = useSearchItemStore();
const selectionRectStore = useSelectionRectStore();
const dialogStore = useShortDialogStore();
const contextMenuStore = useContextMenuStore();
const settingsStore = useSettingsStore();

onMounted(() => {
  document.addEventListener("mousemove", selectionRectStore.handleMouseMove);
  document.addEventListener("mouseup", selectionRectStore.handleMouseUp);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("keyup", handleKeyUp);
});

const handleKeydown = (e: KeyboardEvent) => {
  const focusedItemStore = getFocusedItemStore();
  if (e.key == "Escape") {
    const openItemStore = getTopmostOpenItemStore();
    if (openItemStore) {
      openItemStore.isOpen = false;
      focusedItemStoreId.value = getTopmostOpenItemStore()?.$id ?? "";
    } else if (focusedItemStore.selectedItems.length)
      focusedItemStore.deselectAll(); // File tree
    else focusedItemStoreId.value = "items"; // Primary Explorer
  } else if (e.key == "Delete" && focusedItemStore.selectedItems.length) {
    focusedItemStore.deleteItems();
  } else if (e.key == "F2" && focusedItemStore.selectedItems.length == 1) {
    e.preventDefault();
    focusedItemStore.selectedItems[0].isRenaming = true;
  } else if (e.ctrlKey && e.key == "a") {
    const inEditable =
      document.activeElement?.tagName == "INPUT" ||
      document.activeElement?.tagName == "TEXTAREA" ||
      (document.activeElement as HTMLElement).isContentEditable;
    if (inEditable) return;
    e.preventDefault();
    document.body.style.userSelect = "none";
    focusedItemStore.selectAll();
    document.body.style.userSelect = "";
  }
};
const handleKeyUp = (e: KeyboardEvent) => {
  if (e.key == "Enter" && dialogStore.state.isOpen) {
    if (dialogStore.state.handleConfirmation)
      dialogStore.state.handleConfirmation(true);
    dialogStore.close();
  }
};
const handleClickLeft = (e: MouseEvent) => {
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
const handleMouseDownCapture = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const focusedItemStore = getFocusedItemStore();
  const isInRenameContainer = !!target.closest("#rename-container");
  if (!isInRenameContainer) focusedItemStore.stopRenaming();
  if (!searchItemStore.items.length && !target.closest("#search"))
    searchItemStore.isOpen = false;
  contextMenuStore.hide();
};
</script>

<template>
  <div
    id="home"
    class="flex flex-col"
    :class="{ 'not-ready': !settingsStore.dbSettingsReady }"
    @click.left.capture="handleClickLeft"
    @mousedown="handleMouseDown"
    @mousedown.capture="handleMouseDownCapture"
    @contextmenu="contextMenuStore.hide()"
  >
    <Header id="header" />
    <div id="window" class="flex min-h-0 flex-1 flex-col overflow-clip">
      <ExplorerTabs />
      <Explorer />
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
