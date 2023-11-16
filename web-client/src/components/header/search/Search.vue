<script setup lang="ts">
import ExplorerFooter from "@/components/explorer/ExplorerFooter.vue";
import ExplorerGrid from "@/components/explorer/ExplorerGrid.vue";
import { useSearchItemsStore } from "@/stores/items/items";
import { useSearchStore } from "@/stores/search";
import { provide } from "vue";
import SearchOptions from "./SearchOptions.vue";

provide("isSearch", true);

const searchStore = useSearchStore();
const searchItemsStore = useSearchItemsStore();
</script>

<template>
  <div class="relative">
    <input
      type="text"
      placeholder="Search"
      class="dsy-input dsy-input-bordered dsy-input-primary w-full"
      v-model="searchStore.query"
      spellcheck="false"
      autocomplete="off"
      @focus="searchStore.show()"
    />
    <div
      v-if="searchStore.isOpen"
      class="absolute left-0 right-0 top-full z-10 mt-3 rounded-2xl bg-base-100 p-4 shadow-lg"
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
    <SearchOptions />
  </div>
</template>
