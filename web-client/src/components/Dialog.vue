<script setup lang="ts">
import { CSSProperties, ref, watch } from "vue";

const props = defineProps<{
  show: boolean;
  closeOutside?: boolean;
  modalBoxStyle?: CSSProperties;
}>();
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
    class="dsy-modal border-none"
    @close="emit('close')"
    @click.stop="null"
    @click.self="closeOutside && emit('close')"
  >
    <div
      ref="dialogBoxEl"
      class="dsy-modal-box w-auto py-0 px-0 flex flex-col transition-all duration-1000"
      :style="modalBoxStyle"
    >
      <div v-if="$slots.header" class="bg-base-100 pt-6 pb-3 px-6 text-2xl">
        <slot name="header"></slot>
      </div>
      <div
        class="pb-1 px-6 min-h-0 overflow-auto"
        :class="{ 'pt-6': !$slots.header }"
      >
        <slot name="content"></slot>
      </div>
      <div class="dsy-modal-action bg-base-100 pt-3 pb-6 px-6 m-0">
        <form method="dialog">
          <slot name="actions"></slot>
        </form>
      </div>
    </div>
  </dialog>
</template>
