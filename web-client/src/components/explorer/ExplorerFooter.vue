<script setup lang="ts">
import { ItemStore } from "@/stores/items/manager";
import { formatSize } from "@/utils/format";
import { computed, inject } from "vue";
import ItemOptions from "./ItemOptions.vue";

const props = defineProps<{ itemStore: ItemStore }>();

const isThemeLight = inject<boolean>("isThemeLight")!;

const selectedItemSize = computed(() => {
  const showSize =
    props.itemStore.selectedItems.length &&
    !props.itemStore.selectedItems.some((i) => i.isFolder);
  if (showSize)
    return props.itemStore.selectedItems.reduce((acc, i) => acc + i.size!, 0);
  return "";
});
</script>

<template>
  <div
    class="flex flex-wrap items-center whitespace-nowrap rounded-box rounded-b-none px-1 lg:px-6 mt-auto"
    :class="{
      'bg-base-100/50 shadow-[0_0_50px_0_oklch(var(--p)/30%)]': !isThemeLight,
      'bg-base-300': isThemeLight,
    }"
  >
    <div class="p-4 pr-0">
      {{ itemStore.items.length }}
      {{ itemStore.items.length == 1 ? "item" : "items" }}
    </div>
    <Transition name="fade">
      <div v-if="itemStore.selectedItems?.length">
        <span class="px-3">|</span>{{ itemStore.selectedItems.length }}
        {{ itemStore.selectedItems.length == 1 ? "item" : "items" }} selected
        <Transition name="fade">
          <span v-if="selectedItemSize">
            ({{ formatSize(selectedItemSize) }})
          </span>
        </Transition>
      </div>
    </Transition>
    <ItemOptions :item-store="itemStore" />
  </div>
</template>
