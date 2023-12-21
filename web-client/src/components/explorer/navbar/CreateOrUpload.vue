<script setup lang="ts">
import { useItemStore } from "@/stores/items";

const itemStore = useItemStore();

const handleFileUpload = (e: Event) => {
  const { files } = e.target as HTMLInputElement;
  if (files) itemStore.createFiles(files);
};
</script>

<template>
  <div class="flex gap-3">
    <div class="dsy-join">
      <input
        v-model.trim="itemStore.newFolderName"
        type="text"
        placeholder="Add a new folder"
        class="dsy-input dsy-input-primary dsy-join-item w-full bg-base-100/50 outline-none"
        @keyup.enter.stop="itemStore.createFolder"
        spellcheck="false"
        autocomplete="off"
      />
      <button
        class="dsy-btn dsy-btn-primary dsy-join-item"
        :class="{ 'dsy-btn-disabled': !itemStore.newFolderName }"
        @click="itemStore.createFolder"
        v-wave
      >
        <span class="material-symbols-outlined"> add </span>
      </button>
    </div>
    <div class="dsy-tooltip dsy-tooltip-bottom" data-tip="Upload files">
      <label
        class="dsy-btn dsy-btn-primary"
        tabindex="0"
        @keyup.enter.stop="
          ($event) =>
            (
              ($event.target as HTMLElement).firstElementChild as HTMLElement
            ).click()
        "
        v-wave
      >
        <input type="file" class="hidden" multiple @change="handleFileUpload" />
        <span class="material-symbols-outlined"> cloud_upload </span>
      </label>
    </div>
  </div>
</template>
