<script setup lang="ts">
import Explorer from "@/components/explorer/Explorer.vue";
import ExplorerTabs from "@/components/explorer/ExplorerTabs.vue";
import Header from "@/components/header/Header.vue";
import { useContextMenuStore } from "@/stores/context-menu";
import {
  focusedItemStore,
  useItemStore,
  useNavbarItemStore,
  useSearchItemStore,
} from "@/stores/items";
import treeStores from "@/stores/items/tree-manager";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { useSettingsStore } from "@/stores/settings";
import { useShortDialogStore } from "@/stores/short-dialog";
import { computed, onBeforeMount, onBeforeUnmount } from "vue";

setTimeout(() => {
  console.log(treeStores);
}, 100);

const itemStore = useItemStore();
const searchItemStore = useSearchItemStore();
const navbarItemStore = useNavbarItemStore();
const selectionRectStore = useSelectionRectStore();
const dialogStore = useShortDialogStore();
const contextMenuStore = useContextMenuStore();
const settingsStore = useSettingsStore();

const openItemStore = computed(() => {
  console.log("openItemStore");
  return [searchItemStore, navbarItemStore].find((s) => s.isOpen) ?? itemStore;
});

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
    openItemStore.value.isOpen = openItemStore.value.isFocused = false;
    focusedItemStore.deselectAll();
  } else if (e.key == "Delete" && focusedItemStore.selectedItems.length) {
    focusedItemStore.deleteItems();
  } else if (
    e.key == "F2" &&
    focusedItemStore.selectedItems.length == 1
  ) {
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
    // Necessary because mouseup is triggered before click
    selectionRectStore.wasActive = false;
    return;
  }
  if (e.ctrlKey || e.shiftKey) return;
  focusedItemStore.deselectAll();
};
const handleMouseDownCapture = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest("#rename-container"))
    focusedItemStore.stopRenaming();
  focusedItemStore.isFocused = false;
  if (!searchItemStore.items.length && !target.closest("#search"))
    searchItemStore.isOpen = false;
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
    <!--     <div class="flex flex-col min-h-0">
      <ExplorerTabs />
      <Explorer />
    </div>
    <div class="flex flex-col min-h-0">
      <ExplorerTabs />
      <Explorer />
    </div>
    <div class="flex flex-col min-h-0">
      <ExplorerTabs />
      <Explorer />
    </div> -->
  </div>
</template>
