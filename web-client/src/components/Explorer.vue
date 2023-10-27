<script setup lang="ts">
import api from "@/scripts/api";
import * as utils from "@/scripts/utils";
import { computed, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import ExplorerFooter from "./ExplorerFooter.vue";
import ExplorerNavbar from "./ExplorerNavbar.vue";
import ExplorerTable from "./ExplorerTable.vue";
import modal from "@/scripts/modal";

const router = useRouter();
const route = useRoute();

const items = ref<Item[]>([]);
utils.initClickListener(items);
utils.initSelectAllListener(items);

const folderPaths = ref<string[]>([]);
const currentPath = computed(() => folderPaths.value.at(-1) ?? "");

watchEffect(async () => {
  let newPath = decodeURIComponent(route.path.replace(/\/+/g, "/"));
  if (newPath.startsWith("/")) newPath = newPath.slice(1);
  if (newPath.endsWith("/")) newPath = newPath.slice(0, -1);
  if (newPath) {
    const pathSplit = newPath.split("/");
    folderPaths.value = pathSplit.map((_, i) =>
      pathSplit.slice(0, i + 1).join("/")
    );
  } else folderPaths.value = [];
  items.value = await api.getItems(newPath);
  utils.deselectAll(items.value);
});

async function addFolder(name: string) {
  const item = {
    name,
    dateAdded: new Date(),
    dateModified: new Date(),
    path: currentPath.value,
    isFolder: true,
  };
  items.value.push(item);
  await api.createItem(item);
}

async function addFiles(files: FileList, path?: string) {
  path ??= currentPath.value;
  const newItems = utils.convertFilesToItems(files, path);
  if (!newItems.length) return modal.showError("No valid files were selected.");
  const scopedItems =
    path == currentPath.value ? items.value : await api.getItems(path);
  for (const { name } of newItems) {
    const { isValid, message } = utils.checkName(name, "file", scopedItems);
    if (!isValid) return modal.showError(message);
  }
  if (!newItems.length) return;
  if (path == currentPath.value) items.value.push(...newItems);
  await api.createItems(newItems);
}

function handleItemOpen(item: Item) {
  if (item.isFolder)
    router.push(`${item.path ? `/${item.path}` : ""}/${item.name}`);
  else console.log("open file");
}

function handleDrop(e: DragEvent, path?: string) {
  utils.clearDragOverStyle(e);
  if (e.dataTransfer) addFiles(e.dataTransfer.files, path);
}
</script>

<template>
  <div class="flex-1 flex flex-col mx-5 mb-5 gap-5">
    <ExplorerNavbar
      :items="items"
      :folder-paths="folderPaths"
      :add-folder="addFolder"
      :add-files="addFiles"
      :handle-drop="handleDrop"
    />
    <div
      id="explorer-container"
      class="flex-1 flex rounded-2xl [&.dragover_tr:not(.folder)]:pointer-events-none"
      @drop.stop.prevent="handleDrop"
      @dragover.stop.prevent="utils.setDragOverStyle"
      @dragleave.stop.prevent="utils.clearDragOverStyle"
      @dragend.stop.prevent="utils.clearDragOverStyle"
      @keyup.esc="utils.deselectAll(items)"
    >
      <ExplorerTable
        v-if="items.length"
        :items="items"
        :handleItemOpen="handleItemOpen"
        :handle-drop="handleDrop"
      />
      <div
        v-else
        class="flex-1 flex-center flex-col gap-3 border-2 border-gray-500 border-dashed rounded-2xl pointer-events-none select-none"
      >
        <span class="material-symbols-outlined"> draft </span>
        <div class="text-2xl">Drop files or create a new folder</div>
      </div>
    </div>
    <ExplorerFooter :items="items" />
  </div>
</template>
