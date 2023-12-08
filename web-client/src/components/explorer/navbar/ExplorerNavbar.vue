<script setup lang="ts">
import { useItemsStore, useNavbarItemsStore } from "@/stores/items";
import { useItemsFirestoreStore } from "@/stores/items/firestore";
import { getPathName, usePathStore } from "@/stores/path";
import { RootKey, roots } from "@/stores/settings/default";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { inject, ref, watch } from "vue";
import CreateOrUpload from "./CreateOrUpload.vue";
import ExplorerNavbarDropdown from "./ExplorerNavbarDropdown.vue";
import ExplorerNavbarExplorer from "./ExplorerNavbarExplorer.vue";
import ExplorerNavbarInput from "./ExplorerNavbarInput.vue";
import ViewSelector from "./ViewSelector.vue";

const isThemeLight = inject<boolean>("isThemeLight")!;

const { api: firestoreApi } = useItemsFirestoreStore();
const itemsStore = useItemsStore();
const navbarItemsStore = useNavbarItemsStore();
const pathStore = usePathStore();

const showPathInput = ref(false);
const showRootsDropdown = ref(false);
const explorerPath = ref("");

watch(
  () => navbarItemsStore.isOpen,
  (isOpen) => {
    if (!isOpen) explorerPath.value = "";
  },
);

const handlePathClick = (path: string) => {
  showRootsDropdown.value = false;
  pathStore.pushOnTab(path);
};
const handleArrowClick = (path: string) => {
  if (explorerPath.value == path) {
    navbarItemsStore.isOpen = false;
    return;
  }
  explorerPath.value = path;
  navbarItemsStore.isOpen = navbarItemsStore.isFocused = true;
  if (!navbarItemsStore.isOpen) return;
  navbarItemsStore.setDbItems(firestoreApi.getItems(path));
};
</script>

<template>
  <div class="z-20 flex flex-wrap gap-3">
    <div
      class="relative flex h-12 flex-1 cursor-pointer flex-wrap items-center rounded-btn text-xl"
      :class="{
        'bg-base-200 hover:bg-base-300': isThemeLight,
        'bg-base-300': isThemeLight && showPathInput,
        'bg-base-100/25 hover:bg-base-100/50': !isThemeLight,
        'bg-base-100/50': !isThemeLight && showPathInput,
      }"
      @click="showPathInput = true"
    >
      <ExplorerNavbarInput v-model:show-path-input="showPathInput" />
      <template
        v-if="!showPathInput"
        v-for="(path, i) in pathStore.folderPaths"
      >
        <div
          v-if="i"
          class="relative flex h-full items-center rounded-btn"
          :class="{
            'hover:bg-base-100': isThemeLight,
            'hover:bg-base-300': !isThemeLight,
            'bg-base-100':
              isThemeLight && explorerPath == pathStore.folderPaths[i - 1],
            'bg-base-300':
              !isThemeLight && explorerPath == pathStore.folderPaths[i - 1],
          }"
          @click.stop.self="handleArrowClick(pathStore.folderPaths[i - 1])"
        >
          <span class="material-symbols-outlined pointer-events-none">
            chevron_right
          </span>
          <Transition name="slide-down">
            <ExplorerNavbarExplorer
              v-if="
                navbarItemsStore.isOpen &&
                explorerPath == pathStore.folderPaths[i - 1]
              "
              :current-path="explorerPath"
              :items-store="navbarItemsStore"
            />
          </Transition>
        </div>
        <a
          :href="`/${path}`"
          class="nav-path relative flex h-full items-center whitespace-pre rounded-btn"
          :class="{
            'hover:bg-base-100': isThemeLight,
            'hover:bg-base-300': !isThemeLight,
            'is-current-path': i == pathStore.folderPaths.length - 1,
          }"
          @drop.stop.prevent="itemsStore.handleDrop($event, path)"
          @dragover.stop.prevent="setDragOverStyle"
          @dragleave.stop.prevent="clearDragOverStyle"
          @dragend.stop.prevent="clearDragOverStyle"
          @click.stop.prevent="() => handlePathClick(path)"
          @mouseover="showRootsDropdown = !i"
          @mouseleave="showRootsDropdown = false"
          draggable="false"
          v-wave
        >
          <span
            v-if="!i"
            class="material-symbols-outlined pointer-events-none pl-2 !align-text-bottom"
          >
            {{ roots[path as RootKey]?.icon }}
          </span>
          {{ getPathName(path) }}
          <ExplorerNavbarDropdown
            :show-roots-dropdown="!i && showRootsDropdown"
          />
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
a.nav-path {
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
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-0.5rem) scale(0.75);
}
</style>
