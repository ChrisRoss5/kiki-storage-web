<script setup lang="ts">
import { ref } from "vue";
import Modal from "./Modal.vue";
import { checkName } from "@/utils";

const modal = ref<InstanceType<typeof Modal> | null>(null);

const props = defineProps<{
  items: (File | Folder)[];
  folderPaths: string[];
}>();
const emit = defineEmits<{
  (e: "addFolder", name: string): void; // nosonar
}>();

const newFolderName = ref("");

function handleAddFolderClick() {
  const name = newFolderName.value;
  const { isValid, message } = checkName(name, "folder", props.items);
  if (!isValid) return modal.value?.showError(message);
  emit("addFolder", name);
  newFolderName.value = "";
}
</script>

<template>
  <div class="flex items-center gap-5">
    <div class="flex items-center flex-wrap text-2xl">
      <RouterLink to="/">
        <span class="material-symbols-outlined"> cloud </span>
        Personal drive
      </RouterLink>
      <template v-for="path in folderPaths">
        <span class="material-symbols-outlined"> chevron_right </span>
        <RouterLink :to="`/${path}`" class="whitespace-pre">
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
      <button class="dsy-btn dsy-btn-primary">
        <span class="material-symbols-outlined"> cloud_upload </span>
      </button>
    </div>
    <Modal ref="modal" />
  </div>
</template>
