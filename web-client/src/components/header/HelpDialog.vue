<script setup lang="ts">
import Dialog from "@/components/Dialog.vue";
import { $isTouchDevice } from "@/main";

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
      <div
        class="flex flex-col gap-3"
        :class="{ 'flex-col-reverse': $isTouchDevice }"
      >
        <div>
          <strong class="block">Keyboard shortcuts</strong>
          <p class="mb-2">
            All keyboard shortcuts apply to the currently focused folder. A
            focused folder is indicated by a stronger shadow in floating
            windows, or a differently colored line in a File Tree. If no folder
            is focused, shortcuts apply to the currently open folder.
          </p>
          <ul>
            <li>
              <kbd>Esc</kbd>
              <div class="inline-flex pl-1">
                - Deselect all items & empty app clipboard <br />
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
          <strong class="mt-4 block">Keyboard-mouse shortcuts</strong>
          <ul>
            <li>Hold <kbd>Ctrl</kbd> to select multiple items.</li>
            <li>
              Hold <kbd>Shift</kbd> to select a range of items from the last
              focused item.
            </li>
            <li>
              Hold <kbd>Ctrl</kbd> before dropping items to copy them instead of
              moving.
            </li>
            <li><kbd>Middle-click</kbd> on a tab to close it.</li>
            <li>
              <kbd>Middle-click</kbd> on a folder to open it in a new tab.
            </li>
          </ul>
        </div>
        <div>
          <strong class="block">Touch gestures</strong>
          <ul class="ml-5 list-disc">
            <li>Long-press a tab to start dragging it.</li>
            <li>Swipe right on a folder in a File Tree to navigate to it.</li>
            <li>
              Long-press an item and then move in any direction to select
              multiple items.
            </li>
          </ul>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
kbd {
  @apply dsy-kbd mt-1;
}
</style>
