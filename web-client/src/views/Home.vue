<script setup lang="ts">
import Explorer from "@/components/Explorer.vue";
import Header from "@/components/Header.vue";
import { useItemsStore } from "@/stores/items";
import { useSelectionRectStore } from "@/stores/selectionRect";
import { onBeforeMount, onBeforeUnmount, onMounted, ref } from "vue";

const itemsStore = useItemsStore();
const selectionRectStore = useSelectionRectStore();

const rectEl = ref<HTMLDivElement | null>(null);

onBeforeMount(() => document.addEventListener("keydown", handleKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", handleKeydown));
onMounted(() => (selectionRectStore.rectEl = rectEl.value!));

const handleKeydown = (e: KeyboardEvent) => {
  const selectedItems = itemsStore.selectedItems;
  if (e.key == "Delete" && selectedItems.length) {
    e.preventDefault();
    itemsStore.deleteItems();
  } else if (e.key == "F2" && selectedItems.length == 1) {
    e.preventDefault();
    selectedItems[0].isRenaming = true;
  }
  const inEditable =
    document.activeElement?.tagName == "INPUT" ||
    document.activeElement?.tagName == "TEXTAREA" ||
    (document.activeElement as HTMLElement).isContentEditable;
  if (e.key != "a" || !e.ctrlKey || inEditable) return;
  e.preventDefault();
  document.body.style.userSelect = "none";
  itemsStore.selectAll();
  itemsStore.clearRenaming();
  document.body.style.userSelect = "";
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
    @mouseup.left="selectionRectStore.handleSelectionExit"
    @mouseleave="selectionRectStore.handleSelectionExit"
    @click.left="handleClickLeft"
  >
    <Header class="p-5" />
    <Explorer class="p-5" />
    <div
      ref="rectEl"
      class="fixed border border-primary bg-base-300 pointer-events-none z-50"
    ></div>
  </div>
</template>
