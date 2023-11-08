<script setup lang="ts">
import Explorer from "@/components/explorer/Explorer.vue";
import Header from "@/components/header/Header.vue";
import { useDialogStore } from "@/stores/dialog";
import { useItemsStore, useSearchItemsStore } from "@/stores/items";
import { useSearchStore } from "@/stores/search";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { onBeforeMount, onBeforeUnmount } from "vue";

const itemsStore = useItemsStore();
const searchItemsStore = useSearchItemsStore();
const selectionRectStore = useSelectionRectStore();
const dialogStore = useDialogStore();
const searchStore = useSearchStore();

onBeforeMount(() => {
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("keyup", handleKeyUp);
});
onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("keyup", handleKeyUp);
});

const handleKeydown = (e: KeyboardEvent) => {
  const selectedItems = itemsStore.selectedItems;
  if (e.key == "Escape") {
    if (searchStore.isOpen) searchStore.close();
    else if (selectedItems.length) itemsStore.deselectAll();
  } else if (e.key == "Delete" && selectedItems.length) {
    itemsStore.deleteItems();
  } else if (e.key == "F2" && selectedItems.length == 1) {
    e.preventDefault();
    selectedItems[0].isRenaming = true;
  } else if (e.key == "a" && e.ctrlKey) {
    const inEditable =
      document.activeElement?.tagName == "INPUT" ||
      document.activeElement?.tagName == "TEXTAREA" ||
      (document.activeElement as HTMLElement).isContentEditable;
    if (inEditable) return;
    e.preventDefault();
    document.body.style.userSelect = "none";
    itemsStore.selectAll();
    itemsStore.clearRenaming();
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
  if (!searchItemsStore.items.length) searchStore.close();
  if (e.ctrlKey || e.shiftKey) return;
  itemsStore.deselectAll();
  itemsStore.clearRenaming();
};
</script>

<template>
  <div
    class="flex flex-col"
    @mousemove="selectionRectStore.handleMouseMove"
    @mouseup.left="selectionRectStore.handleLeftMouseUp"
    @click.left="handleClickLeft"
  >
    <Header class="p-5" />
    <Explorer class="p-5" />
  </div>
</template>
