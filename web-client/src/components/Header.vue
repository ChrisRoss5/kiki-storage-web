<script setup lang="ts">
import ExplorerContainer from "@/components/ExplorerContainer.vue";
import { useSearchStore } from "@/stores/search";
import { provide } from "vue";

provide("isSearch", true);

const searchStore = useSearchStore();
</script>

<template>
  <div class="flex items-center gap-5">
    <a class="flex-center text-2xl">
      <img alt="" class="h-14 mr-3" src="/logo.png" />
      Dropbox Clone
    </a>
    <div class="relative flex-1">
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
        class="absolute top-full left-0 right-0 shadow-lg rounded-2xl bg-base-100 px-4 py-4 mt-3 z-10"
      >
        <ExplorerContainer v-if="searchStore.itemsFound" class="max-h-[70vh]" />
        <div v-else class="flex-center flex-col gap-3">
          <span class="material-symbols-outlined"> search </span>
          <div>No results found</div>
        </div>
      </div>
    </div>
    <div>
      <img alt="" class="rounded-full h-14" src="@/assets/default-pfp.webp" />
    </div>
  </div>
</template>
