<script setup lang="ts">
import Explorer from "@/components/Explorer.vue";
import Header from "@/components/Header.vue";
import { useDialogStore } from "@/stores/dialog";
import { useItemsStore } from "@/stores/items";
import { useSelectionRectStore } from "@/stores/selectionRect";
import { onBeforeMount, onBeforeUnmount } from "vue";

const itemsStore = useItemsStore();
const selectionRectStore = useSelectionRectStore();
const dialogStore = useDialogStore();

onBeforeMount(() => document.addEventListener("keydown", handleKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", handleKeydown));

const handleKeydown = (e: KeyboardEvent) => {
  const selectedItems = itemsStore.selectedItems;
  if (
    e.key == "Enter" &&
    dialogStore.state.isOpen &&
    dialogStore.state.handleConfirmation
  ) {
    e.preventDefault();
    dialogStore.state.handleConfirmation(true);
    dialogStore.close();
  }
  if (e.key == "Delete" && selectedItems.length) {
    e.preventDefault();
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
const handleClickLeft = (e: MouseEvent) => {
  if (selectionRectStore.wasActive) {
    // Necessary because mouseup is triggered before click
    selectionRectStore.wasActive = false;
    return;
  }
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
