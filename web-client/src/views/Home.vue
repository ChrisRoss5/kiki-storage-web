<script setup lang="ts">
import Explorer from "@/components/explorer/Explorer.vue";
import ExplorerTabs from "@/components/explorer/ExplorerTabs.vue";
import Header from "@/components/header/Header.vue";
import { useContextMenuStore } from "@/stores/context-menu";
import {
  useItemsStore,
  useNavbarItemsStore,
  useSearchItemsStore,
} from "@/stores/items";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { useSettingsStore } from "@/stores/settings";
import { useShortDialogStore } from "@/stores/short-dialog";
import { computed, onBeforeMount, onBeforeUnmount } from "vue";

const itemsStore = useItemsStore();
const searchItemsStore = useSearchItemsStore();
const navbarItemsStore = useNavbarItemsStore();
const selectionRectStore = useSelectionRectStore();
const dialogStore = useShortDialogStore();
const contextMenuStore = useContextMenuStore();
const settingsStore = useSettingsStore();
const focusedItemsStore = computed(
  () =>
    [searchItemsStore, navbarItemsStore].find((s) => s.isFocused) ?? itemsStore,
);
const openItemsStore = computed(
  () =>
    [searchItemsStore, navbarItemsStore].find((s) => s.isOpen) ?? itemsStore,
);

onBeforeMount(() => {
  document.addEventListener("mousemove", selectionRectStore.handleMouseMove);
  document.addEventListener("mouseup", handleLeftMouseUp);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("keyup", handleKeyUp);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousemove", selectionRectStore.handleMouseMove);
  document.removeEventListener("mouseup", handleLeftMouseUp);
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("keyup", handleKeyUp);
});

const handleLeftMouseUp = (e: MouseEvent) => {
  if (e.button != 0) return;
  selectionRectStore.handleLeftMouseUp();
};
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key == "Escape") {
    openItemsStore.value.isOpen = openItemsStore.value.isFocused = false;
    focusedItemsStore.value.deselectAll();
  } else if (
    e.key == "Delete" &&
    focusedItemsStore.value.selectedItems.length
  ) {
    focusedItemsStore.value.deleteItems();
  } else if (
    e.key == "F2" &&
    focusedItemsStore.value.selectedItems.length == 1
  ) {
    e.preventDefault();
    focusedItemsStore.value.selectedItems[0].isRenaming = true;
  } else if (e.ctrlKey && e.key == "a") {
    const inEditable =
      document.activeElement?.tagName == "INPUT" ||
      document.activeElement?.tagName == "TEXTAREA" ||
      (document.activeElement as HTMLElement).isContentEditable;
    if (inEditable) return;
    e.preventDefault();
    document.body.style.userSelect = "none";
    focusedItemsStore.value.selectAll();
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
    // Necessary because mouseup is triggered before click
    selectionRectStore.wasActive = false;
    return;
  }
  if (e.ctrlKey || e.shiftKey) return;
  focusedItemsStore.value.deselectAll();
};
const handleMouseDownCapture = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest("#rename-container"))
    focusedItemsStore.value.stopRenaming();
  focusedItemsStore.value.isFocused = false;
  if (!searchItemsStore.items.length && !target.closest("#search"))
    searchItemsStore.isOpen = false;
  contextMenuStore.hide();
};
</script>

<template>
  <div
    v-if="settingsStore.dbSettingsReady"
    class="flex flex-col"
    @click.left="handleClickLeft"
    @mousedown.capture="handleMouseDownCapture"
    @contextmenu="contextMenuStore.hide()"
  >
    <Header />
    <ExplorerTabs />
    <Explorer />
  </div>
</template>
