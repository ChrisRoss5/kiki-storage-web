<script setup lang="ts">
import { useItemsStore } from "@/stores/items";
import { getPathName, usePathStore } from "@/stores/path";
import { RootKey, roots } from "@/stores/settings/default";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { inject, nextTick, ref, watch } from "vue";
import CreateOrUpload from "./CreateOrUpload.vue";
import ViewSelector from "./ViewSelector.vue";

const isThemeLight = inject<boolean>("isThemeLight")!;

const itemsStore = useItemsStore();
const pathStore = usePathStore();

const pathInput = ref<HTMLInputElement | null>(null);
const showPathInput = ref(false);
const newPath = ref("");
const showRootsDropdown = ref(false);

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
  pathStore.pushOnTab(newPath.value);
};
</script>

<template>
  <div class="z-[2] flex flex-wrap gap-3" @click.stop="null">
    <div
      class="relative flex flex-1 cursor-pointer flex-wrap items-center rounded-btn text-xl"
      :class="{
        'bg-base-200 hover:bg-base-300': isThemeLight,
        'bg-base-300': isThemeLight && showPathInput,
        'bg-base-100/25 hover:bg-base-100/50': !isThemeLight,
        'bg-base-100/50': !isThemeLight && showPathInput,
      }"
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
            class="material-symbols-outlined cursor-pointer rounded-badge border border-primary bg-base-200 p-1 px-2 transition-opacity duration-300 hover:bg-base-300"
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
        <a
          :href="`/${path}`"
          class="relative whitespace-pre rounded-btn px-2 py-1"
          :class="{
            'hover:bg-base-100': isThemeLight,
            'hover:bg-base-300': !isThemeLight,
            'is-current-path': i == pathStore.folderPaths.length - 1,
          }"
          @drop.stop.prevent="itemsStore.handleDrop($event, path)"
          @dragover.stop.prevent="setDragOverStyle"
          @dragleave.stop.prevent="clearDragOverStyle"
          @dragend.stop.prevent="clearDragOverStyle"
          @click.stop.prevent="pathStore.pushOnTab(path)"
          @mouseover="showRootsDropdown = !i"
          @mouseleave="showRootsDropdown = false"
          draggable="false"
          v-wave
        >
          <span
            v-if="!i"
            class="material-symbols-outlined pointer-events-none pr-2 !align-text-bottom"
          >
            {{ roots[path as RootKey]?.icon }}
          </span>
            {{ getPathName(path) }}
          <div
            class="dsy-dropdown absolute left-0 top-full min-w-full"
            :class="{ 'dsy-dropdown-open': !i && showRootsDropdown }"
          >
            <ul
              tabindex="0"
              class="dsy-menu dsy-dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow"
            >
              <a
                v-for="root in Object.keys(roots)"
                :key="root"
                :href="`/${root}`"
                class="rounded-btn px-1 py-3 text-xl"
                :class="{
                  'pointer-events-none bg-base-200 bg-none font-bold':
                    root == pathStore.currentRoot,
                }"
                @click.stop.prevent="pathStore.pushOnTab(root)"
              >
                <span class="material-symbols-outlined pr-2 !align-text-bottom">
                  {{ roots[root as RootKey]?.icon }} </span
                >{{ getPathName(root) }}
              </a>
            </ul>
          </div>
        </a>
      </template>
    </div>
    <div class="flex w-full gap-3 lg:w-auto">
      <ViewSelector />
      <CreateOrUpload class="ml-auto" />
    </div>
  </div>
</template>

<style scoped>
a {
  transition:
    transform 300ms,
    border 300ms;
  border-width: 2px;
  border-color: transparent;
  white-space: pre;
  &.dragover {
    transform: scale(1.25);
    border: 2px dashed oklch(var(--bc));
    + span {
      visibility: hidden;
    }
  }
}
</style>
