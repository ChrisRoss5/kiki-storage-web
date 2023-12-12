<script setup lang="ts">
import { stores } from '@/stores/items';

</script>

<template>
  <div class="relative flex flex-1 flex-col">
<!--     <LoaderIcon :loading="itemsStore.itemsPending" />
    <template v-if="itemsStore.items.length">
      <ExplorerGrid
        class="flex-1"
        :items-store="itemsStore"
        :current-path="pathStore.currentPath"
      />
      <ExplorerFooter :items-store="itemsStore" />
    </template> -->
  </div>
</template>
