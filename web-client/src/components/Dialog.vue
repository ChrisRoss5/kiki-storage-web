<script setup lang="ts">
import { ref, watch } from "vue";
import { useSlots } from 'vue'

const slots = useSlots()
const props = defineProps<{ show: boolean; closeOutside?: boolean }>();
const emit = defineEmits<(e: "close") => void>();

const dialogEl = ref<HTMLDialogElement | null>(null);

watch(
  () => props.show,
  (show) => {
    if (show) dialogEl.value?.showModal();
    else dialogEl.value?.close();
  }
);
</script>

<template>
  <!-- Using empty click.stop to prevent
    triggering global listeners in Home.vue -->
  <dialog
    ref="dialogEl"
    class="dsy-modal"
    @close="emit('close')"
    @click.stop="null"
    @click.self="closeOutside && emit('close')"
  >
    <div class="dsy-modal-box">
      <div v-if="$slots.header" class="">
        <slot name="header"></slot>
      </div>
      <slot name="content"></slot>
      <div class="dsy-modal-action">
        <form method="dialog">
          <slot name="actions"></slot>
        </form>
      </div>
    </div>
  </dialog>
</template>
