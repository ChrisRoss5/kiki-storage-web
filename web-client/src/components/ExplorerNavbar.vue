<script setup lang="ts">
import * as utils from "@/scripts/utils";
import { ref } from "vue";
import { showError } from "@/scripts/modal";

const props = defineProps<{
  items: Item[];
  folderPaths: string[];
  addFolder: (name: string) => void;
  addFiles: (files: FileList, path?: string) => void;
  handleDrop: (e: DragEvent, path?: string) => void;
}>();

const newFolderName = ref("");

function handleAddFolderClick() {
  const name = newFolderName.value;
  const { isValid, message } = utils.checkName(name, "folder", props.items);
  if (!isValid) return showError(message);
  props.addFolder(name);
  newFolderName.value = "";
}

function handleFileUpload(e: Event) {
  const { files } = e.target as HTMLInputElement;
  if (files) props.addFiles(files);
}
</script>

<template>
  <div class="flex items-center gap-5">
    <div class="flex items-center flex-wrap text-2xl">
      <RouterLink
        to="/"
        @drop.stop.prevent="handleDrop($event, '')"
        @dragover.stop.prevent="utils.setDragOverStyle"
        @dragleave.stop.prevent="utils.clearDragOverStyle"
        @dragend.stop.prevent="utils.clearDragOverStyle"
        draggable="false"
      >
        <span class="material-symbols-outlined"> cloud </span>
        Personal drive
      </RouterLink>
      <template v-for="path in folderPaths">
        <span class="material-symbols-outlined"> chevron_right </span>
        <RouterLink
          :to="`/${path}`"
          class="whitespace-pre"
          @drop.stop.prevent="handleDrop($event, path)"
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
      />
      <button
        class="dsy-join-item dsy-btn dsy-btn-primary"
        :class="{ 'dsy-btn-disabled': !newFolderName }"
        @click="handleAddFolderClick"
      >
        <span class="material-symbols-outlined"> add </span>
      </button>
    </div>
    <div class="dsy-tooltip" data-tip="Upload files">
      <label class="dsy-btn dsy-btn-primary">
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
