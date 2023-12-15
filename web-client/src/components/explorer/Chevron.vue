<script setup lang="ts">
defineProps<{ isExpanded?: boolean }>();
</script>

<template>
  <span
    class="material-symbols-outlined pointer-events-none transition-[transform,opacity]"
    :class="{ 'rotate-90': isExpanded }"
  >
    chevron_right
  </span>
</template>
