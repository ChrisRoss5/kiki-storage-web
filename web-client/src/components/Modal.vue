<script setup lang="ts">
import { state } from "@/scripts/modal";
import { ref, watch } from "vue";

const dialog = ref<HTMLDialogElement | null>(null);

watch(
  () => state.trigger,
  () => dialog.value?.showModal()
);
</script>

<template>
  <dialog ref="dialog" class="dsy-modal">
    <div class="dsy-modal-box">
      <div v-if="state.isError" class="dsy-alert dsy-alert-error">
        <span class="material-symbols-outlined"> cancel </span>
        <div>{{ state.message }}</div>
      </div>
      <div v-else>{{ state.message }}</div>
      <div class="dsy-modal-action">
        <form method="dialog">
          <button class="dsy-btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>
</template>
