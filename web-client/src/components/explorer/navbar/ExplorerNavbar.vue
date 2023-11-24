<script setup lang="ts">
import { useItemsStore } from "@/stores/items";
import { roots, usePathStore, getPathName } from "@/stores/path";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { nextTick, ref, watch } from "vue";
import { useRouter } from "vue-router";
import CreateOrUpload from "./CreateOrUpload.vue";
import ViewSelector from "./ViewSelector.vue";

const itemsStore = useItemsStore();
const pathStore = usePathStore();
const router = useRouter();

const pathInput = ref<HTMLInputElement | null>(null);
const showPathInput = ref(false);
const newPath = ref("");

watch(
  showPathInput,
  async (showPathInput) => {
    if (!showPathInput) return;
    newPath.value = pathStore.currentPath;
    await nextTick();
    pathInput.value?.select();
  },
  { flush: "post" },
);

const handlePathSubmit = () => {
  showPathInput.value = false;
  router.push({ path: `/${newPath.value}` });
};
</script>

<template>
  <div class="z-[2] flex gap-3" @click.stop="null">
    <div
      class="relative flex flex-1 cursor-pointer flex-wrap items-center rounded-lg bg-base-100/25 text-xl hover:bg-base-100/50"
      :class="{ '!bg-base-100/50': showPathInput }"
      @click="showPathInput = true"
    >
      <template v-if="showPathInput">
        <input
          type="text"
          ref="pathInput"
          placeholder="Enter location"
          class="dsy-input dsy-input-bordered dsy-input-primary w-full bg-transparent text-xl"
          v-model="newPath"
          @keydown.stop.escape="showPathInput = false"
          @keyup.stop.enter="handlePathSubmit"
          @blur="showPathInput = false"
          spellcheck="false"
          autocomplete="off"
        />
        <div class="absolute bottom-0 right-2 top-0 flex items-center gap-2">
          <div
            class="material-symbols-outlined cursor-pointer rounded-full border border-primary bg-base-200 p-1 px-2 transition-opacity duration-300 hover:bg-base-300"
            :class="{ 'pointer-events-none opacity-30': !newPath }"
            @mousedown="handlePathSubmit"
          >
            arrow_right_alt
          </div>
        </div>
      </template>
      <template v-else v-for="(path, i) in pathStore.folderPaths">
        <span
          v-if="i"
          class="material-symbols-outlined flex w-3 justify-center"
        >
          chevron_right
        </span>
        <span v-else class="material-symbols-outlined pointer-events-none pl-2">
          {{ roots[path as keyof typeof roots].icon }}
        </span>
        <RouterLink
          :to="`/${path}`"
          class="whitespace-pre rounded-lg px-2 py-1 hover:bg-base-300"
          @drop.stop.prevent="itemsStore.handleDrop($event, path)"
          @dragover.stop.prevent="setDragOverStyle"
          @dragleave.stop.prevent="clearDragOverStyle"
          @dragend.stop.prevent="clearDragOverStyle"
          @click.stop="null"
          draggable="false"
          v-wave
        >
          {{ getPathName(path) }}
        </RouterLink>
      </template>
    </div>
    <div class="flex gap-3">
      <ViewSelector />
      <CreateOrUpload />
    </div>
  </div>
</template>

<style scoped>
a {
  transition:
    transform 250ms,
    border 250ms;
  border-width: 2px;
  border-color: transparent;
  white-space: pre;
  &.dragover {
    transform: scale(1.25);
    border: 2px dashed hsl(var(--bc));
    + span {
      visibility: hidden;
    }
  }
}
</style>
