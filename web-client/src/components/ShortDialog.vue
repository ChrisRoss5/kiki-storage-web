<script setup lang="ts">
import { useShortDialogStore } from "@/stores/short-dialog";
import { storeToRefs } from "pinia";
import Dialog from "./Dialog.vue";

const store = useShortDialogStore();
const { state } = storeToRefs(store);
</script>

<template>
  <Dialog
    :show="state.isOpen"
    :closeOutside="!state.handleConfirmation"
    @close="store.close"
  >
    <template #content>
      <div v-if="state.isError" class="dsy-alert dsy-alert-error">
        <span class="material-symbols-outlined"> cancel </span>
        <div class="max-w-full overflow-hidden break-words">
          {{ state.message }}
        </div>
      </div>
      <div v-else class="max-w-full overflow-hidden break-words">
        {{ state.message }}
      </div>
    </template>
    <template #actions>
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
    </template>
  </Dialog>
</template>
