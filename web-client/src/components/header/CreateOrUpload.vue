<script setup lang="ts">
import { useItemsStore } from "@/stores/items";
import { ref } from "vue";

const itemsStore = useItemsStore();

const newFolderName = ref("");

const handleAddFolderClick = () => {
  const name = newFolderName.value;
  if (itemsStore.isNameInvalid(name, true)) return;
  itemsStore.addFolder(name);
  newFolderName.value = "";
};
const handleFileUpload = (e: Event) => {
  const { files } = e.target as HTMLInputElement;
  if (files) itemsStore.addFiles(files);
};
</script>

<template>
  <div class="dsy-join">
    <input
      v-model.trim="newFolderName"
      type="text"
      placeholder="Add a new folder"
      class="dsy-join-item dsy-input dsy-input-primary outline-none"
      @keyup.enter.stop="handleAddFolderClick"
      spellcheck="false"
      autocomplete="off"
    />
    <button
      class="dsy-join-item dsy-btn dsy-btn-primary"
      :class="{ 'dsy-btn-disabled': !newFolderName }"
      @click="handleAddFolderClick"
      v-wave
    >
      <span class="material-symbols-outlined"> add </span>
    </button>
  </div>
  <div class="dsy-tooltip dsy-tooltip-bottom" data-tip="Upload files">
    <label
      class="dsy-btn dsy-btn-primary"
      tabindex="0"
      @keyup.enter.stop="($event) => (
          ($event.target as HTMLElement).firstElementChild as HTMLElement).click()"
      v-wave
    >
      <input type="file" class="hidden" multiple @change="handleFileUpload" />
      <span class="material-symbols-outlined"> cloud_upload </span>
    </label>
  </div>
</template>
