<script setup lang="ts">
defineProps<{
  isExpanded?: boolean;
}>();
</script>

<template>
  <span
    class="material-symbols-outlined pointer-events-none transition-[transform,opacity] duration-300"
    :class="{ 'rotate-90': isExpanded }"
  >
    chevron_right
  </span>
</template>
