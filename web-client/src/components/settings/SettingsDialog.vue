<script setup lang="ts">
import Dialog from "@/components/Dialog.vue";
import Themes from "./Themes.vue";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<(e: "close") => void>();

const handleSave = () => {};
const handleReset = () => {};
const handleClear = () => {};
</script>

<template>
  <Dialog
    class="[&_:first-child]:max-w-[90vw]"
    :show="props.show"
    :closeOutside="true"
    @close="emit('close')"
  >
    <template #content>
      <div class="sticky top-0 text-2xl bg-base-100 ">Settings</div>
      <Themes />
    </template>
    <template #actions>
      <form method="dialog">
        <button class="dsy-btn dsy-btn-primary" @click="handleSave">
          Save
        </button>
        <button class="dsy-btn" @click="handleReset">Reset</button>
        <button class="dsy-btn" @click="handleClear">Clear</button>
      </form>
    </template>
  </Dialog>
</template>
