<script setup lang="ts">
import { defineTreeStore } from "@/stores/items";
import { roots } from "@/stores/settings/default";
import { provide } from "vue";
import ExplorerGrid from "../ExplorerGrid.vue";

provide("isFileTree", true);
</script>

<template>
  <div id="filetree" class="relative flex flex-1 flex-col overflow-auto">
    <div v-for="(rootValue, rootKey) in roots" :key="rootKey">
      <span class="material-symbols-outlined pointer-events-none">
        {{ rootValue.icon }}
      </span>
      {{ rootValue.name }}
      <KeepAlive>
        <ExplorerGrid
          :items-store="defineTreeStore(rootKey)"
          :path="rootKey"
          :depth="0"
        />
      </KeepAlive>
    </div>
  </div>
</template>
