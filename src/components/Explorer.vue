<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import ExplorerNavbar from "./ExplorerNavbar.vue";
import ExplorerBody from "./ExplorerBody.vue";
import ExplorerFooter from "./ExplorerFooter.vue";
import { isFolder } from "@/utils";

const router = useRouter();
const table = ref<InstanceType<typeof ExplorerBody> | null>(null);

const items = reactive<(File | Folder)[]>([]);
const folderPaths = ref<string[]>([]);
const currentPath = computed(() => folderPaths.value.at(-1) || "");

function addFolder(name: string) {
  const path = currentPath.value ? `${currentPath.value}/${name}` : name;
  items.push({ name, dateAdded: new Date(), path: currentPath.value });
}

function handleItemDblClicked(item: Item) {
  if (isFolder(item)) router.push(item.name);
  else console.log("open file");
}
</script>

<template>
  <div class="flex-1 flex flex-col mx-5 mb-5 gap-5">
    <ExplorerNavbar :items="items" @add-folder="addFolder" />
    <div id="main" class="flex-1 flex" @click.self="table?.deselectAll">
      <ExplorerBody
        v-if="items.length"
        :items="items"
        ref="table"
        @item-dbl-clicked="handleItemDblClicked"
      />
      <div
        v-else
        class="flex-1 flex-center border-2 border-gray-500 border-dashed rounded-2xl"
      >
        <div class="flex flex-col items-center gap-5">
          <span class="material-symbols-outlined"> draft </span>
          <div class="text-2xl">Drop files or create a new folder</div>
        </div>
      </div>
    </div>
    <ExplorerFooter :items="items" :selectedItems="table?.selectedItems" />
  </div>
</template>

<style scoped></style>
