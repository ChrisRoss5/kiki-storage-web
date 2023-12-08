<script setup lang="ts">
import { ItemsStore } from "@/stores/items";
import { formatSize } from "@/utils/format";
import { computed, inject } from "vue";
import ItemOptions from "../ItemOptions.vue";

const props = defineProps<{
  itemsStore: ItemsStore;
}>();

const isThemeLight = inject<boolean>("isThemeLight")!;

const selectedItemsSize = computed(() => {
  const showSize =
    props.itemsStore.selectedItems.length &&
    !props.itemsStore.selectedItems.some((i) => i.isFolder);
  if (showSize)
    return props.itemsStore.selectedItems.reduce((acc, i) => acc + i.size!, 0);
  return "";
});
</script>

<template>
  <div
    class="flex items-center rounded-box rounded-b-none px-6"
    :class="{
      'bg-base-100/50 shadow-[0_0_50px_0_oklch(var(--p)/30%)]': !isThemeLight,
      'bg-base-300': isThemeLight,
    }"
  >
    <div class="p-4 pr-0">
      {{ itemsStore.items.length }}
      {{ itemsStore.items.length == 1 ? "item" : "items" }}
    </div>
    <Transition name="fade">
      <div v-if="itemsStore.selectedItems?.length">
        <span class="px-3">|</span>{{ itemsStore.selectedItems.length }}
        {{ itemsStore.selectedItems.length == 1 ? "item" : "items" }} selected
        <Transition name="fade">
          <span v-if="selectedItemsSize">
            ({{ formatSize(selectedItemsSize) }})
          </span>
        </Transition>
      </div>
    </Transition>
    <ItemOptions :items-store="itemsStore" />
  </div>
</template>
