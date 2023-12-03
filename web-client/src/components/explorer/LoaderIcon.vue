<script setup lang="ts">
defineProps<{ loading: boolean }>();
</script>

<template>
  <Transition name="fade">
    <div v-if="loading" class="flex-center absolute text-primary inset-0">
      <span class="dsy-loading dsy-loading-spinner w-9"></span>
    </div>
  </Transition>
</template>
