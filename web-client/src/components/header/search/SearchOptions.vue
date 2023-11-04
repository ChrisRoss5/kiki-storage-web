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
  <div class="absolute top-0 right-2 bottom-0 flex items-center gap-2">
    <div
      class="cursor-pointer bg-base-200 hover:bg-base-300 rounded-full border border-primary p-1 px-2"
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
      class="cursor-pointer bg-base-200 hover:bg-base-300 rounded-full border border-primary p-1 px-2"
      @click="showTypeDialog = true"
    >
      {{ searchStore.type || "Type" }}
      <TypeDialog :show="showTypeDialog" @close="showTypeDialog = false" />
    </div>
    <div
      class="cursor-pointer bg-base-200 hover:bg-base-300 rounded-full border border-primary p-1 px-2"
      @click="searchStore.reset"
    >
      <span class="material-symbols-outlined"> close </span>
    </div>
  </div>
</template>
