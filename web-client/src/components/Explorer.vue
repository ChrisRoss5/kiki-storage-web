<script setup lang="ts">
import ExplorerFooter from "./ExplorerFooter.vue";
import ExplorerNavbar from "./ExplorerNavbar.vue";
import ExplorerContainer from "./ExplorerContainer.vue";
import { provide } from "vue";

provide("isSearch", false);
</script>

<template>
  <div class="flex-1 flex flex-col mx-5 mb-5 gap-5 min-h-0">
    <ExplorerNavbar />
    <ExplorerContainer />
    <ExplorerFooter />
  </div>
</template>
