<script setup lang="ts">
import Dialog from "@/components/Dialog.vue";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<(e: "close") => void>();
</script>

<template>
  <Dialog :show="props.show" :closeOutside="true" @close="emit('close')">
    <template #header> Help </template>
    <template #content>
      <strong>Keyboard shortcuts</strong>
      <ul>
        <li></li>
      </ul>
      <strong>Touch gestures</strong>
      <ul class="list-inside list-disc">
        <li>Touch and hold a tab for 0.5s to start dragging it.</li>
        <li>Swipe down/up a file tree folder to expand/collapse it.</li>
      </ul>
    </template>
  </Dialog>
</template>
