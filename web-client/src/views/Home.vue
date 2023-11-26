<script setup lang="ts">
import Explorer from "@/components/explorer/Explorer.vue";
import ExplorerTabs from "@/components/explorer/ExplorerTabs.vue";
import Header from "@/components/header/Header.vue";
import { useContextMenuStore } from "@/stores/context-menu";
import { useItemsStore } from "@/stores/items";
import { useSearchStore } from "@/stores/search";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { useSettingsStore } from "@/stores/settings";
import { useShortDialogStore } from "@/stores/short-dialog";
import { onBeforeMount, onBeforeUnmount } from "vue";

const itemsStore = useItemsStore(false);
const searchItemsStore = useItemsStore(true);
const selectionRectStore = useSelectionRectStore();
const dialogStore = useShortDialogStore();
const searchStore = useSearchStore();
const contextMenuStore = useContextMenuStore();
const settingsStore = useSettingsStore();

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
  const { selectedItems } = itemsStore;
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
};
</script>

<template>
  <Transition name="fade">
    <div
      v-if="settingsStore.dbSettings"
      class="flex flex-col"
      @click.left="handleClickLeft"
      @mousedown="contextMenuStore.hide()"
      @contextmenu="contextMenuStore.hide()"
    >
      <Header />
      <ExplorerTabs />
      <Explorer />
    </div>
  </Transition>
</template>
