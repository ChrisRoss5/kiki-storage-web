<script setup lang="ts">
import { ref } from "vue";

defineExpose({ show, showError });

const dialog = ref<HTMLDialogElement | null>(null);

const message = ref("");
const isError = ref(false);

function show(_message = "") {
  message.value = _message;
  isError.value = false;
  dialog.value?.showModal();
}

function showError(_message = "") {
  message.value = _message;
  isError.value = true;
  dialog.value?.showModal();
}
</script>

<template>
  <dialog ref="dialog" class="dsy-modal">
    <div class="dsy-modal-box">
      <div v-if="isError" class="dsy-alert dsy-alert-error">
        <span class="material-symbols-outlined"> cancel </span>
        <div v-if="message">{{ message }}</div>
        <slot v-else></slot>
      </div>
      <template v-else>
        <div v-if="message">{{ message }}</div>
        <slot v-else></slot>
      </template>
      <div class="dsy-modal-action">
        <form method="dialog">
          <button class="dsy-btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>
</template>
