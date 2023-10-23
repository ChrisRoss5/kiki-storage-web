<script setup lang="ts">
import { ref } from "vue";

defineProps<{ isError?: boolean }>();
defineExpose({ open });

const dialog = ref<HTMLDialogElement | null>(null);

function open() {
  dialog.value?.showModal();
}
</script>

<template>
  <dialog ref="dialog" class="dsy-modal">
    <div class="dsy-modal-box">
      <div v-if="isError" class="dsy-alert dsy-alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <slot class="py-4"></slot>
      </div>
      <slot v-else></slot>
      <div class="dsy-modal-action">
        <form method="dialog">
          <button class="dsy-btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>
</template>

<style scoped></style>
