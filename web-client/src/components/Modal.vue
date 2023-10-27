<script setup lang="ts">
import { ref, watch } from "vue";
import modal from "@/scripts/modal";

const dialog = ref<HTMLDialogElement | null>(null);

watch(() => modal.state.isOpen, (isOpen) => {
  if (isOpen) dialog.value?.showModal();
});

</script>

<template>
  <dialog ref="dialog" class="dsy-modal" @close="modal.close">
    <div class="dsy-modal-box">
      <div v-if="modal.state.isError" class="dsy-alert dsy-alert-error">
        <span class="material-symbols-outlined"> cancel </span>
        <div>{{ modal.state.message }}</div>
      </div>
      <div v-else>{{ modal.state.message }}</div>
      <div class="dsy-modal-action">
        <form method="dialog">
          <template v-if="modal.state.handleConfirmation">
            <button
              class="dsy-btn dsy-btn-primary"
              @click="modal.state.handleConfirmation(true)"
            >
              Confirm
            </button>
            <button class="dsy-btn" @click="modal.state.handleConfirmation(false)">
              Cancel
            </button>
          </template>
          <button v-else class="dsy-btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>
</template>
