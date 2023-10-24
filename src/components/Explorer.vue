<script setup lang="ts">
import {  isFolder } from "@/utils";
import { computed, reactive, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import ExplorerTable from "./ExplorerTable.vue";
import ExplorerFooter from "./ExplorerFooter.vue";
import ExplorerNavbar from "./ExplorerNavbar.vue";
import Modal from "./Modal.vue";

const router = useRouter();
const route = useRoute();
const explorerTable = ref<InstanceType<typeof ExplorerTable> | null>(null);
const modal = ref<InstanceType<typeof Modal> | null>(null);  // todo

const items = reactive<(File | Folder)[]>([]);
const folderPaths = ref<string[]>([]);
const currentPath = computed(() => folderPaths.value.at(-1) ?? "");

watchEffect(() => {
  /* const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${todoId.value}`
    )
    data.value = await response.json() */
  let newPath = decodeURIComponent(route.path.replace(/\/+/g, "/"));
  if (newPath.startsWith("/")) newPath = newPath.slice(1);
  if (newPath.endsWith("/")) newPath = newPath.slice(0, -1);
  if (newPath) {
    const pathSplit = newPath.split("/");
    folderPaths.value = pathSplit.map((_, i) =>
      pathSplit.slice(0, i + 1).join("/")
    );
  } else folderPaths.value = [];
  items.length = 0;
});

function addFolder(name: string) {
  items.push({ name, dateAdded: new Date(), path: currentPath.value });
}

function handleItemDblClicked(item: Item) {
  if (isFolder(item))
    router.push(`${item.path ? `/${item.path}` : ""}/${item.name}`);
  else console.log("open file");
}
</script>

<template>
  <div class="flex-1 flex flex-col mx-5 mb-5 gap-5">
    <ExplorerNavbar
      :items="items"
      :folderPaths="folderPaths"
      @add-folder="addFolder"
    />
    <div class="flex-1 flex" @click.self="explorerTable?.deselectAll">
      <ExplorerTable
        v-if="items.length"
        :items="items"
        ref="explorerTable"
        @item-dbl-clicked="handleItemDblClicked"
      />
      <div
        v-else
        class="flex-1 flex-center flex-col gap-3 border-2 border-gray-500 border-dashed rounded-2xl"
      >
        <span class="material-symbols-outlined"> draft </span>
        <div class="text-2xl">Drop files or create a new folder</div>
      </div>
    </div>
    <ExplorerFooter
      :items="items"
      :selectedItems="explorerTable?.selectedItems"
    />
    <Modal ref="modal" />
  </div>
</template>
