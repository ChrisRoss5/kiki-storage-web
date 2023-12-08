<script setup lang="ts">
import { usePathStore } from "@/stores/path";
import { nextTick, ref, watch } from "vue";

const props = defineProps<{
  showPathInput: boolean;
}>();
const emit = defineEmits<{
  (e: "update:showPathInput", value: boolean): void;
}>();

const pathStore = usePathStore();

const pathInput = ref<HTMLInputElement | null>(null);
const newPath = ref("");

watch(
  () => props.showPathInput,
  async (showPathInput) => {
    if (!showPathInput) return;
    newPath.value = pathStore.currentPath;
    await nextTick();
    pathInput.value?.select();
  },
  { flush: "post" },
);

const handlePathSubmit = () => {
  emit("update:showPathInput", false);
  pathStore.pushOnTab(newPath.value);
};
</script>

<template>
  <template v-if="showPathInput">
    <input
      type="text"
      ref="pathInput"
      placeholder="Enter location"
      class="dsy-input dsy-input-bordered dsy-input-primary w-full bg-transparent text-xl"
      v-model="newPath"
      @keydown.stop.escape="emit('update:showPathInput', false)"
      @keyup.stop.enter="handlePathSubmit"
      @blur="emit('update:showPathInput', false)"
      spellcheck="false"
      autocomplete="off"
    />
    <div class="absolute bottom-0 right-2 top-0 flex items-center gap-2">
      <div
        class="material-symbols-outlined cursor-pointer rounded-badge border border-primary bg-base-200 p-1 px-2 transition-opacity duration-300 hover:bg-base-300"
        :class="{ 'pointer-events-none opacity-30': !newPath }"
        @mousedown="handlePathSubmit"
      >
        arrow_right_alt
      </div>
    </div>
  </template>
</template>
