<script setup lang="ts">
import CloseExplorer from "@/components/explorer/CloseExplorer.vue";
import ExplorerFooter from "@/components/explorer/ExplorerFooter.vue";
import ExplorerGrid from "@/components/explorer/ExplorerGrid.vue";
import LoaderIcon from "@/components/explorer/LoaderIcon.vue";
import { useSearchItemsStore } from "@/stores/items";
import { usePathStore } from "@/stores/path";
import { useSearchStore } from "@/stores/search";
import { provide } from "vue";
import SearchOptions from "./SearchOptions.vue";

provide("isSearch", true);
provide("isFileTree", false);
provide("isThemeLight", true);

const searchStore = useSearchStore();
const searchItemsStore = useSearchItemsStore();
const pathStore = usePathStore();
</script>

<template>
  <div
    id="search"
    @mousedown.capture="
      {
        searchItemsStore.isOpen = searchStore.areFiltersActive;
        searchItemsStore.isFocused = true;
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
        v-if="searchItemsStore.isOpen"
        class="absolute left-0 right-0 top-full mt-1 rounded-box bg-base-100 px-4 shadow-lg transition-shadow"
        :class="{ 'shadow-base-content/50': searchItemsStore.isFocused }"
      >
        <LoaderIcon :loading="searchItemsStore.itemsPending" />
        <template v-if="searchItemsStore.items.length">
          <CloseExplorer @click="searchItemsStore.isOpen = false" />
          <ExplorerGrid
            :items-store="searchItemsStore"
            :path="pathStore.currentPath"
            class="in-search max-h-[70vh]"
          />
          <ExplorerFooter :items-store="searchItemsStore" class="mt-3" />
        </template>
        <div v-else class="flex-center flex-col gap-3 py-3">
          <span class="material-symbols-outlined"> search </span>
          <div>No results found</div>
        </div>
      </div>
    </Transition>
    <SearchOptions />
  </div>
</template>
