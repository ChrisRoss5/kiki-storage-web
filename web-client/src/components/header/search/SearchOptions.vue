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
        'border-primary !bg-primary text-primary-content':
          searchStore.sizeFilter.min || searchStore.sizeFilter.max,
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
    </div>
    <div
      class="cursor-pointer rounded-badge border border-primary bg-base-200 p-1 px-2 hover:bg-base-300"
      :class="{
        'border-primary !bg-primary text-primary-content': searchStore.type,
      }"
      @click="showTypeDialog = true"
    >
      {{ searchStore.type || "Type" }}
    </div>
    <div
      class="dsy-tooltip dsy-tooltip-bottom cursor-pointer rounded-badge border border-primary bg-base-200 transition-opacity hover:bg-base-300"
      :class="{
        'pointer-events-none opacity-30': !searchStore.areFiltersActive,
      }"
      @click="searchStore.reset"
      data-tip="Reset search"
    >
      <span class="material-symbols-outlined p-1 px-2"> close </span>
    </div>
    <SizeDialog :show="showSizeDialog" @close="showSizeDialog = false" />
    <TypeDialog :show="showTypeDialog" @close="showTypeDialog = false" />
  </div>
</template>
