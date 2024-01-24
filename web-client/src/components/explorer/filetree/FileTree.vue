<script setup lang="ts">
import { useItemStore } from "@/stores/items/manager";
import { usePathStore } from "@/stores/path";
import { roots } from "@/stores/settings/default";
import { useTabsStore } from "@/stores/tabs";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { useSwipe } from "@vueuse/core";
import { inject, onMounted, provide, ref, watch } from "vue";
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

const itemRootAnchors = ref<HTMLAnchorElement[]>([]);

onMounted(() => {
  for (const anchor of itemRootAnchors.value) {
    const { isSwiping, direction } = useSwipe(anchor);
    watch(isSwiping, (isSwiping) => {
      if (isSwiping && direction.value == "right")
        pathStore.pushOnTab(`/${anchor.id}`);
    });
  }
});

/* Code is similar to ExplorerGridItem.vue */
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
    <TransitionGroup name="items">
      <template v-for="(rootValue, rootKey) in roots" :key="rootKey">
        <a
          :id="rootKey"
          :href="`/${rootKey}`"
          ref="itemRootAnchors"
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
          @click.stop.prevent="
            $inputMechanism.isCoarse
              ? (
                  ($event.target as HTMLElement)
                    .firstElementChild as HTMLElement
                ).click()
              : pathStore.pushOnTab(`/${rootKey}`)
          "
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
