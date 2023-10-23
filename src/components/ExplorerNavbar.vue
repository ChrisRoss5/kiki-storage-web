<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import Modal from "./Modal.vue";
import { isDuplicateName } from "@/utils";

const errorModal = ref<InstanceType<typeof Modal> | null>(null);
const router = useRouter();

const props = defineProps<{
  items: (File | Folder)[];
  folderPath: string[];
}>();
const emit = defineEmits<{
  (e: "addFolder", name: string): void;
}>();

const newFolderName = ref("");

function handleFolderAdd() {
  if (isDuplicateName(newFolderName.value, "folder", props.items))
    return errorModal.value?.open();
  emit("addFolder", newFolderName.value);
  newFolderName.value = "";
}
</script>

<template>
  <div class="flex items-center gap-5">
    <div class="text-2xl">
      <div @click="router.push('/')">
        <span class="material-symbols-outlined"> cloud </span>
        Personal drive
      </div>
      <template v-if="folderPath.length">
        <span class="material-symbols-outlined"> chevron_right </span>
        <span v-for="folder in folderPath">
          {{ folder }}
          <span
            v-show="folder != folderPath.at(-1)"
            class="material-symbols-outlined"
          >
            chevron_right
          </span>
        </span>
      </template>
    </div>
    <div class="dsy-join">
      <input
        v-model="newFolderName"
        type="text"
        placeholder="Add a new folder"
        class="dsy-join-item dsy-input dsy-input-primary outline-none"
      />
      <button
        class="dsy-join-item dsy-btn dsy-btn-primary"
        :class="{ 'dsy-btn-disabled': !newFolderName }"
        @click="handleFolderAdd"
      >
        <span class="material-symbols-outlined"> add </span>
      </button>
    </div>
    <button class="dsy-btn dsy-btn-primary">
      <span class="material-symbols-outlined"> cloud_upload </span>
    </button>
    <Modal :is-error="true" ref="errorModal">
      A folder named "{{ newFolderName }}" already exists!
    </Modal>
  </div>
</template>

<style scoped></style>
