<script setup lang="ts">
import Explorer from "@/components/Explorer.vue";
import api from "@/scripts/api";
import { ref, watch } from "vue";

const query = ref("");
const showResults = ref(false);
const results = ref<Item[]>([]);

watch(query, async (query) => {
  showResults.value = !!query.length;
  if (!query.length) return;
  //results.value = await api.searchItems(query);
});
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
        v-model="query"
      />
      <div
        v-if="showResults"
        class="absolute top-full left-0 right-0 max-h-40 shadow-lg rounded-md bg-base-100 px-4 py-4 mt-3 z-10"
      >
        <Explorer />
      </div>
    </div>

    <div>
      <img alt="" class="rounded-full h-14" src="@/assets/default-pfp.webp" />
    </div>
  </div>
</template>
