<script setup lang="ts">
import { _defineStore } from "@/stores/items";
import { roots } from "@/stores/settings/default";
import { provide, ref } from "vue";
import ExplorerGrid from "../ExplorerGrid.vue";

provide("isFileTree", true);

const props = defineProps<{
  depth?: number;
  path?: string;
}>();

const store = props.path ? _defineStore(`tree-items-${props.path}`) : null;
const isExpanded = ref(false);
</script>

<template>
  <div class="relative flex flex-1 flex-col">
    <div v-if="!depth" v-for="(rootValue, rootKey) in roots" :key="rootKey">
      <span class="material-symbols-outlined pointer-events-none">
        {{ rootValue.icon }}
      </span>
      {{ rootValue.name }}
      <ExplorerGrid
        :items-store="_defineStore(`tree-items-${rootKey}`)()"
        :current-path="rootKey"
      />
    </div>
  </div>
</template>
