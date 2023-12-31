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
  },
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
      class="dsy-modal-box flex max-h-[80vh] w-auto flex-col px-0 py-0"
      :style="modalBoxStyle"
    >
      <div v-if="$slots.header" class="bg-base-100 px-6 pb-3 pt-6 text-2xl">
        <slot name="header"></slot>
      </div>
      <div
        class="min-h-0 overflow-auto px-6 pb-1"
        :class="{ 'pt-6': !$slots.header, 'pb-6': !$slots.actions }"
      >
        <slot name="content"></slot>
      </div>
      <div
        v-if="$slots.actions"
        class="dsy-modal-action m-0 bg-base-100 px-6 pb-6 pt-3"
      >
        <form method="dialog">
          <slot name="actions"></slot>
        </form>
      </div>
    </div>
  </dialog>
</template>
