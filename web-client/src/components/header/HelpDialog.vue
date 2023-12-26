<script setup lang="ts">
import Dialog from "@/components/Dialog.vue";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<(e: "close") => void>();
</script>

<template>
  <Dialog
    :show="props.show"
    :closeOutside="true"
    :modalBoxStyle="{ 'min-width': 'min(45rem, 100vw)' }"
    @close="emit('close')"
  >
    <template #header> Help </template>
    <template #content>
      <strong class="m-0 block">Keyboard shortcuts</strong>
      <p class="mb-2">
        All keyboard shortcuts apply to the currently focused explorer. A
        focused explorer is indicated by a stronger shadow in floating
        explorers, or a differently colored line in a File Tree explorer. If no
        explorer is focused, shortcuts apply to the primary explorer.
      </p>
      <ul>
        <li>
          <kbd>Esc</kbd> - Close a floating explorer / Deselect all items /
          Unfocus a File Tree explorer
        </li>
        <li><kbd>Del</kbd> - Delete selected items</li>
        <li><kbd>F2</kbd> - Rename selected item</li>
        <li><kbd>Ctrl</kbd> + <kbd>A</kbd> - Select all items</li>
      </ul>
      <strong class="mt-4 block">Touch gestures</strong>
      <ul class="list-inside list-disc">
        <li>Touch and hold a tab for 0.5s to start dragging it.</li>
        <li>Swipe down/up a file tree folder to expand/collapse it.</li>
      </ul>
    </template>
  </Dialog>
</template>

<style scoped>
kbd {
  @apply dsy-kbd mt-1;
}
</style>
