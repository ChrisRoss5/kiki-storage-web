<script setup lang="ts">
import { useItemStore } from "@/stores/items";
import { usePathStore } from "@/stores/path";
import { roots } from "@/stores/settings/default";
import { useTabsStore } from "@/stores/tabs";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { inject, provide, ref } from "vue";
import ExpandButton from "./ExpandButton.vue";
import FileTreeGrid from "./FileTreeGrid.vue";
import FolderOptions from "./FolderOptions.vue";

provide("isFileTree", true);
const isThemeLight = inject<boolean>("isThemeLight")!;

const fileTreeDiv = ref<HTMLDivElement | null>(null);
defineExpose({ fileTreeDiv });

const itemStore = useItemStore();
const pathStore = usePathStore();
const tabsStore = useTabsStore();
</script>

<template>
  <div
    id="filetree"
    ref="fileTreeDiv"
    class="relative flex flex-col overflow-x-hidden overflow-y-scroll"
    :style="{
      width: tabsStore.activeTab.fileTreeWidth
        ? `${tabsStore.activeTab.fileTreeWidth}px`
        : 'auto',
    }"
  >
    <TransitionGroup name="rows">
      <template v-for="(rootValue, rootKey) in roots" :key="rootKey">
        <a
          :href="`/${rootKey}`"
          tabindex="0"
          draggable="false"
          class="expl-item is-list folder group flex"
          :class="{
            'hover:bg-base-200': isThemeLight,
            'hover:bg-base-100/25': !isThemeLight,
          }"
          @drop.stop.prevent="itemStore.handleDrop($event, rootKey)"
          @dragover.stop.prevent="setDragOverStyle"
          @dragleave.stop.prevent="clearDragOverStyle"
          @dragend.stop.prevent="clearDragOverStyle"
          @click.stop.prevent="pathStore.pushOnTab(`/${rootKey}`)"
          v-wave
        >
          <ExpandButton :path="rootKey" />
          <span class="material-symbols-outlined pointer-events-none">
            {{ rootValue.icon }}
          </span>
          <span class="!pl-0">
            {{ rootValue.name }}
          </span>
          <FolderOptions :path="rootKey" />
        </a>
        <FileTreeGrid
          v-if="tabsStore.activeTab.expandedPaths?.includes(rootKey)"
          :path="rootKey"
          :key="`${rootKey}-filetree`"
        />
      </template>
    </TransitionGroup>
  </div>
</template>
