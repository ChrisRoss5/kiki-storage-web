<script setup lang="ts">
import CloseExplorer from "@/components/explorer/CloseExplorer.vue";
import ExplorerFooter from "@/components/explorer/ExplorerFooter.vue";
import ExplorerGrid from "@/components/explorer/ExplorerGrid.vue";
import LoaderIcon from "@/components/explorer/LoaderIcon.vue";
import { useSearchItemStore } from "@/stores/items/manager";
import { usePathStore } from "@/stores/path";
import { useSearchStore } from "@/stores/search";
import { provide } from "vue";
import SearchOptions from "./SearchOptions.vue";

provide("isSearch", true);
provide("isFileTree", false);
provide("isThemeLight", true);

const searchStore = useSearchStore();
const searchItemStore = useSearchItemStore();
const pathStore = usePathStore();
</script>

<template>
  <div
    id="search"
    @mousedown="
      {
        searchItemStore.isOpen = searchStore.areFiltersActive;
        searchItemStore.isFocused = true;
      }
    "
  >
    <input
      type="text"
      :placeholder="`Search ${pathStore.currentRoot}`"
      class="dsy-input dsy-input-bordered dsy-input-primary w-full bg-base-100"
      v-model="searchStore.query"
      spellcheck="false"
      autocomplete="off"
    />
    <Transition name="slide-down">
      <div
        id="search-results"
        v-if="searchItemStore.isOpen"
        class="absolute left-0 right-0 top-full mt-3 rounded-box bg-base-100 px-4 shadow-lg transition-shadow"
        :class="{ 'focused-store': searchItemStore.isFocused }"
      >
        <LoaderIcon :loading="searchItemStore.itemsPending" />
        <template v-if="searchItemStore.items.length">
          <CloseExplorer @click="searchItemStore.isOpen = false" class="pt-0" />
          <ExplorerGrid
            :item-store="searchItemStore"
            class="in-search max-h-[70vh]"
          />
          <ExplorerFooter :item-store="searchItemStore" class="mt-3" />
        </template>
        <div v-else class="flex-center flex-col gap-3 pb-3 pt-1">
          <span class="material-symbols-outlined"> search </span>
          <div>No results found</div>
        </div>
      </div>
    </Transition>
    <SearchOptions />
  </div>
</template>
