<script setup lang="ts">
import CloseExplorer from "@/components/explorer/CloseExplorer.vue";
import ExplorerFooter from "@/components/explorer/ExplorerFooter.vue";
import ExplorerGrid from "@/components/explorer/ExplorerGrid.vue";
import LoaderIcon from "@/components/explorer/LoaderIcon.vue";
import { focusedItemStoreId, useSearchItemStore } from "@/stores/items/manager";
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
    @mousedown.stop="
      {
        searchItemStore.isOpen = searchStore.areFiltersActive;
        focusedItemStoreId = searchItemStore.$id;
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
        class="absolute left-0 right-0 top-full mt-3 rounded-box bg-base-100 px-4 transition-shadow shadow-lg"
        :class="{ 'focused-store': focusedItemStoreId == searchItemStore.$id }"
      >
        <LoaderIcon :loading="searchItemStore.itemsPending" />
        <template v-if="searchItemStore.items.length">
          <CloseExplorer @click="searchItemStore.isOpen = false" class="pt-0" />
          <div class="max-h-[70vh]">
            <ExplorerGrid :item-store="searchItemStore" />
          </div>
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
