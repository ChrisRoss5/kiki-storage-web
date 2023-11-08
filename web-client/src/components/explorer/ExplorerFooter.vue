<script setup lang="ts">
import { useItemsStore, useSearchItemsStore } from "@/stores/items";
import { formatSize } from "@/utils/format";
import { computed, inject } from "vue";

const isSearch = inject<boolean>("isSearch")!;
const itemsStore = isSearch ? useSearchItemsStore() : useItemsStore();

const selectedItems = computed(() =>
  itemsStore.items.filter((i) => i.isSelected)
);
const selectedItemsSize = computed(() => {
  const showSize =
    selectedItems.value?.length && !selectedItems.value.some((i) => i.isFolder);
  if (showSize) return selectedItems.value.reduce((acc, i) => acc + i.size!, 0);
  return "";
});
</script>

<template>
  <div class="flex items-center bg-base-200 shadow-md px-6 rounded-2xl">
    <div class="p-4 pr-0">
      {{ itemsStore.items.length }}
      {{ itemsStore.items.length == 1 ? "item" : "items" }}
    </div>
    <div v-if="selectedItems?.length">
      <span class="px-3">|</span>{{ selectedItems.length }}
      {{ selectedItems.length == 1 ? "item" : "items" }} selected
      <template v-if="selectedItemsSize">
        ({{ formatSize(selectedItemsSize) }})
      </template>
    </div>
    <Transition name="fade">
      <div class="ml-auto flex" v-if="selectedItems?.length">
        <div
          class="dsy-tooltip p-4 cursor-pointer hover:bg-base-300"
          data-tip="Download"
          @click.stop=""
          v-wave
        >
          <span class="material-symbols-outlined leading-4"> download </span>
        </div>
        <div
          class="dsy-tooltip p-4 cursor-pointer hover:bg-base-300"
          data-tip="Share"
          @click.stop=""
          v-wave
        >
          <span class="material-symbols-outlined leading-4"> share </span>
        </div>
        <div
          v-show="selectedItems.length == 1"
          class="dsy-tooltip p-4 cursor-pointer hover:bg-base-300"
          data-tip="Rename"
          @click.stop="
            selectedItems[0].isRenaming = !selectedItems[0].isRenaming
          "
          v-wave
        >
          <span class="material-symbols-outlined leading-4"> edit </span>
        </div>
        <div
          class="dsy-tooltip p-4 cursor-pointer hover:bg-base-300"
          data-tip="Delete"
          @click.stop="itemsStore.deleteItems"
          v-wave
        >
          <span class="material-symbols-outlined leading-4"> delete </span>
        </div>
      </div>
    </Transition>
  </div>
</template>
