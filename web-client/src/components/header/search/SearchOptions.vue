<script setup lang="ts">
import { useSearchStore } from "@/stores/search";
import { ref } from "vue";
import SizeDialog from "./SizeDialog.vue";
import TypeDialog from "./TypeDialog.vue";

const searchStore = useSearchStore();

const showSizeDialog = ref(false);
const showTypeDialog = ref(false);
</script>

<template>
  <div class="absolute bottom-0 right-2 top-0 flex items-center gap-2">
    <div
      class="cursor-pointer rounded-badge border border-primary bg-base-200 p-1 px-2 hover:bg-base-300"
      :class="{
        '!bg-secondary text-secondary-content border-secondary': searchStore.sizeFilter.min || searchStore.sizeFilter.max,
      }"
      @click="showSizeDialog = true"
    >
      <template v-if="searchStore.sizeFilter.min || searchStore.sizeFilter.max">
        {{ searchStore.sizeFilter.min.toLocaleString() }}
        {{ searchStore.sizeFilter.minSuffix }}
        -
        <template v-if="searchStore.sizeFilter.max">
          {{ searchStore.sizeFilter.max.toLocaleString() }}
          {{ searchStore.sizeFilter.maxSuffix }}
        </template>
        <template v-else>∞</template>
      </template>
      <template v-else> Size </template>
      <SizeDialog :show="showSizeDialog" @close="showSizeDialog = false" />
    </div>
    <div
      class="cursor-pointer rounded-badge border border-primary bg-base-200 p-1 px-2 hover:bg-base-300"
      :class="{ '!bg-primary': searchStore.type }"
      @click="showTypeDialog = true"
    >
      {{ searchStore.type || "Type" }}
      <TypeDialog :show="showTypeDialog" @close="showTypeDialog = false" />
    </div>
    <div
      class="material-symbols-outlined cursor-pointer rounded-badge border border-primary bg-base-200 p-1 px-2 transition-opacity duration-300 hover:bg-base-300"
      :class="[searchStore.areFiltersActive ? '' : ['pointer-events-none', 'opacity-30']]"
      @click="searchStore.reset"
    >
      close
    </div>
  </div>
</template>
