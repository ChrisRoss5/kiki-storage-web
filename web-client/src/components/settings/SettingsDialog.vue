<script setup lang="ts">
import { ref, watch } from "vue";
import Themes from "./Themes.vue";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<(e: "close") => void>();

const settingsDialog = ref<HTMLDialogElement | null>(null);

watch(
  () => props.show,
  (show) => {
    if (!show) return;
    settingsDialog.value!.showModal();
  }
);

const handleSave = () => {};
const handleReset = () => {};
const handleClear = () => {};
</script>

<template>
  <dialog ref="settingsDialog" class="dsy-modal" @close="emit('close')">
    <div class="dsy-modal-box max-w-[90vw]">
      <div class="text-2xl">Settings</div>
      <Themes />
      <div class="dsy-modal-action">
        <form method="dialog">
          <button class="dsy-btn dsy-btn-primary" @click="handleSave">
            Save
          </button>
          <button class="dsy-btn" @click="handleReset">Reset</button>
          <button class="dsy-btn" @click="handleClear">Clear</button>
        </form>
      </div>
    </div>
  </dialog>
</template>
