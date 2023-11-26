<script setup lang="ts">
import { useItemsStore } from "@/stores/items";
import { formatSize } from "@/utils/format";
import { computed, inject } from "vue";
import ItemOptions from "../ItemOptions.vue";

const isSearch = inject<boolean>("isSearch")!;
const itemsStore = useItemsStore(isSearch);

const selectedItemsSize = computed(() => {
  const showSize =
    itemsStore.selectedItems.length &&
    !itemsStore.selectedItems.some((i) => i.isFolder);
  if (showSize)
    return itemsStore.selectedItems.reduce((acc, i) => acc + i.size!, 0);
  return "";
});
</script>

<template>
  <div
    class="rounded-box flex items-center bg-base-100/50 px-6 shadow-[0_0_50px_0_oklch(var(--p)/30%)]"
    :class="{ 'rounded-b-none': !isSearch }"
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
