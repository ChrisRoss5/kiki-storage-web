<script setup lang="ts">
import * as modal from "@/scripts/modal";
import { ref, watch } from "vue";

const dialog = ref<HTMLDialogElement | null>(null);

watch(
  () => modal.state.trigger,
  () => dialog.value?.showModal()
);

function handleConfirmation(confirmed: boolean) {
  modal.state.isConfirmed = confirmed;
  modal.reset();
}
</script>

<template>
  <dialog ref="dialog" class="dsy-modal">
    <div class="dsy-modal-box">
      <div v-if="modal.state.isError" class="dsy-alert dsy-alert-error">
        <span class="material-symbols-outlined"> cancel </span>
        <div>{{ modal.state.message }}</div>
      </div>
      <div v-else>{{ modal.state.message }}</div>
      <div class="dsy-modal-action">
        <form method="dialog">
          <template v-if="modal.state.isConfirmation">
            <button
              class="dsy-btn dsy-btn-primary"
              @click="handleConfirmation(true)"
            >
              Confirm
            </button>
            <button class="dsy-btn" @click="handleConfirmation(false)">
              Cancel
            </button>
          </template>
          <button v-else class="dsy-btn" @click="modal.reset()">Close</button>
        </form>
      </div>
    </div>
  </dialog>
</template>
