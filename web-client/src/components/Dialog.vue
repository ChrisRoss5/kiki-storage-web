<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useDialogStore } from "@/stores/dialog";
import { ref, watch } from "vue";

const store = useDialogStore();
const { state } = storeToRefs(store);
const dialogEl = ref<HTMLDialogElement | null>(null);

watch(
  () => state.value.isOpen,
  (isOpen) => {
    if (isOpen) dialogEl.value?.showModal();
  }
);
</script>

<template>
  <dialog ref="dialogEl" class="dsy-modal" @close="store.close">
    <div class="dsy-modal-box">
      <div v-if="state.isError" class="dsy-alert dsy-alert-error">
        <span class="material-symbols-outlined"> cancel </span>
        <div>{{ state.message }}</div>
      </div>
      <div v-else>{{ state.message }}</div>
      <div class="dsy-modal-action">
        <form method="dialog">
          <template v-if="state.handleConfirmation">
            <button
              class="dsy-btn dsy-btn-primary"
              @click="state.handleConfirmation(true)"
            >
              Confirm
            </button>
            <button class="dsy-btn" @click="state.handleConfirmation(false)">
              Cancel
            </button>
          </template>
          <button v-else class="dsy-btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>
</template>
