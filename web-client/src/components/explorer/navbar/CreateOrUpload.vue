<script setup lang="ts">
import { useItemStore } from "@/stores/items/manager";
import { usePathStore } from "@/stores/path";
import { readDirectoryRecursively } from "@/utils/file";

const itemStore = useItemStore();
const pathStore = usePathStore();

const handleFileUpload = (e: Event) => {
  const { files } = e.target as HTMLInputElement;
  if (files) itemStore.createFiles([...files]);
};

const handleMultifileUpload = async () => {
  const files = await readDirectoryRecursively();
  const path = pathStore.currentPath;
  const root = Object.keys(files).find((key) => !key.includes("/"))!;
  if (!itemStore.createFolder(root, path, true)) return;
  itemStore.createFiles(files[root], path, true);
  delete files[root];
  for (const key in files) {
    const folderPath = `${path}/${key.slice(0, key.lastIndexOf("/"))}`;
    const folderName = key.slice(key.lastIndexOf("/") + 1);
    itemStore.createFolder(folderName, folderPath, false);
    itemStore.createFiles(files[key], `${path}/${key}`, false);
  }
};
</script>

<template>
  <div
    class="flex gap-3"
    :class="{
      'pointer-events-none opacity-50': pathStore.currentRoot != 'drive',
    }"
  >
    <div class="dsy-join">
      <input
        v-model.trim="itemStore.newFolderName"
        type="text"
        placeholder="Add a new folder"
        class="dsy-input dsy-join-item dsy-input-primary w-full bg-base-100/50 outline-none"
        @keyup.enter.stop="itemStore.createFolder()"
        spellcheck="false"
        autocomplete="off"
      />
      <button
        class="dsy-btn dsy-btn-primary dsy-join-item"
        :class="{ 'dsy-btn-disabled': !itemStore.newFolderName }"
        @click="itemStore.createFolder()"
        v-wave
      >
        <span class="material-symbols-outlined"> add </span>
      </button>
    </div>
    <div class="dsy-tooltip dsy-tooltip-bottom" data-tip="Upload files">
      <button v-if="$pwa.isInstalled" class="dsy-btn dsy-btn-primary" @click="handleMultifileUpload">
        <span class="material-symbols-outlined"> cloud_upload </span>
      </button>
      <label
        v-else
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
