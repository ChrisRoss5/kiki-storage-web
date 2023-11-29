<script setup lang="ts">
import ExplorerFooter from "@/components/explorer/ExplorerFooter.vue";
import ExplorerGrid from "@/components/explorer/ExplorerGrid.vue";
import { useItemsStore } from "@/stores/items";
import { useSearchStore } from "@/stores/search";
import { provide } from "vue";
import SearchOptions from "./SearchOptions.vue";

provide("isSearch", true);
provide("isThemeLight", true);

const searchStore = useSearchStore();
const searchItemsStore = useItemsStore(true);
</script>

<template>
  <div>
    <input
      type="text"
      placeholder="Search"
      class="dsy-input dsy-input-bordered dsy-input-primary w-full bg-base-100"
      v-model="searchStore.query"
      spellcheck="false"
      autocomplete="off"
      @focus="searchStore.show()"
    />
    <Transition name="slide-down">
      <div
        id="search-results"
        v-if="searchStore.isOpen"
        class="absolute left-0 right-0 top-full z-10 mt-3 rounded-box bg-base-100 p-4 shadow-lg transition-shadow duration-300"
        :class="{ 'shadow-base-content/50': searchStore.isFocused }"
      >
        <template v-if="searchItemsStore.items.length">
          <ExplorerGrid class="in-search max-h-[70vh]" />
          <ExplorerFooter class="mt-3" />
        </template>
        <div v-else class="flex-center flex-col gap-3">
          <span class="material-symbols-outlined"> search </span>
          <div>No results found</div>
        </div>
      </div>
    </Transition>
    <SearchOptions />
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition:
    opacity 300ms,
    transform 300ms;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
