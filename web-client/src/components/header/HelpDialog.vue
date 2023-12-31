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
        All keyboard shortcuts apply to the currently focused folder. A focused
        folder is indicated by a stronger shadow in floating windows, or a
        differently colored line in a File Tree. If no folder is focused,
        shortcuts apply to the currently open folder.
      </p>
      <ul>
        <li>
          <kbd>Esc</kbd>
          <div class="inline-flex pl-1">
            - Deselect all items & empty clipboard <br />
            - Close a floating folder <br />
            - Unfocus a folder in File Tree
          </div>
        </li>
        <li><kbd>Del</kbd> - Delete selected items</li>
        <li><kbd>F2</kbd> - Rename selected item</li>
        <li><kbd>Ctrl</kbd> + <kbd>A</kbd> - Select all items</li>
        <li><kbd>Ctrl</kbd> + <kbd>C</kbd> - Copy selected items</li>
        <li><kbd>Ctrl</kbd> + <kbd>X</kbd> - Cut selected items</li>
        <li><kbd>Ctrl</kbd> + <kbd>V</kbd> - Paste items from clipboard</li>
      </ul>
      <strong class="mt-4 block">Touch gestures</strong>
      <ul class="list-inside list-disc">
        <li>Touch and hold a tab for 0.5s to start dragging it.</li>
        <li>Swipe right on a folder in a File Tree to open it.</li>
      </ul>
    </template>
  </Dialog>
</template>

<style scoped>
kbd {
  @apply dsy-kbd mt-1;
}
</style>
