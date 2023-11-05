<script setup lang="ts">
import ExplorerContainer from "@/components/ExplorerContainer.vue";
import ExplorerFooter from "@/components/ExplorerFooter.vue";
import { useSearchStore } from "@/stores/search";
import { provide } from "vue";
import SearchOptions from "./SearchOptions.vue";
import { useSearchItemsStore } from "@/stores/items";

provide("isSearch", true);

const searchStore = useSearchStore();
const searchItemsStore = useSearchItemsStore();
</script>

<template>
  <div class="relative">
    <input
      type="text"
      placeholder="Search"
      class="w-full dsy-input dsy-input-bordered dsy-input-primary"
      v-model="searchStore.query"
      spellcheck="false"
      autocomplete="off"
      @focus="searchStore.show()"
    />
    <div
      v-if="searchStore.isOpen"
      class="absolute top-full left-0 right-0 shadow-lg rounded-2xl bg-base-100 p-4 mt-3 z-10"
    >
      <template v-if="searchItemsStore.items.length">
        <ExplorerContainer class="in-search max-h-[70vh]" />
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
