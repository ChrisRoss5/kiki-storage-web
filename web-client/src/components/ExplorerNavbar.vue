<script setup lang="ts">
import * as utils from "@/scripts/utils";
import { useItemsStore } from "@/stores/items";
import { usePathStore } from "@/stores/path";
import { ref } from "vue";

const itemsStore = useItemsStore();
const pathStore = usePathStore();
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
  <div class="flex items-center gap-5">
    <div class="flex items-center flex-wrap text-2xl">
      <RouterLink
        to="/"
        @drop.stop.prevent="itemsStore.handleDrop($event, '')"
        @dragover.stop.prevent="utils.setDragOverStyle"
        @dragleave.stop.prevent="utils.clearDragOverStyle"
        @dragend.stop.prevent="utils.clearDragOverStyle"
        draggable="false"
      >
        <span class="material-symbols-outlined pr-2 pointer-events-none">
          cloud
        </span>
        <span class="pointer-events-none">Personal drive</span>
      </RouterLink>
      <template v-for="path in pathStore.folderPaths">
        <span class="material-symbols-outlined"> chevron_right </span>
        <RouterLink
          :to="`/${path}`"
          class="whitespace-pre"
          @drop.stop.prevent="itemsStore.handleDrop($event, path)"
          @dragover.stop.prevent="utils.setDragOverStyle"
          @dragleave.stop.prevent="utils.clearDragOverStyle"
          @dragend.stop.prevent="utils.clearDragOverStyle"
          draggable="false"
        >
          {{ path.slice(path.lastIndexOf("/") + 1) }}
        </RouterLink>
      </template>
    </div>
    <div class="dsy-join">
      <input
        v-model.trim="newFolderName"
        type="text"
        placeholder="Add a new folder"
        class="dsy-join-item dsy-input dsy-input-primary outline-none"
        @keyup.enter="handleAddFolderClick"
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
    <div class="dsy-tooltip" data-tip="Upload files">
      <label
        class="dsy-btn dsy-btn-primary"
        tabindex="0"
        @keyup.enter="($event) => (
          ($event.target as HTMLElement).firstElementChild as HTMLElement).click()"
        v-wave
      >
        <input type="file" class="hidden" multiple @change="handleFileUpload" />
        <span class="material-symbols-outlined"> cloud_upload </span>
      </label>
    </div>
  </div>
</template>

<style scoped>
a {
  transition: transform 250ms, border 250ms;
  border-width: 2px;
  border-color: transparent;
  white-space: pre;
  &.dragover {
    transform: scale(1.25);
    border: 2px dashed #fff;
    + span {
      visibility: hidden;
    }
  }
}
</style>
