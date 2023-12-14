<script setup lang="ts">
import { useItemsStore } from "@/stores/items";
import { usePathStore } from "@/stores/path";
import { roots } from "@/stores/settings/default";
import { useTabsStore } from "@/stores/tabs";
import { inject, provide } from "vue";
import ExpandButton from "./ExpandButton.vue";
import FileTreeGrid from "./FileTreeGrid.vue";

provide("isFileTree", true);
const isThemeLight = inject<boolean>("isThemeLight")!;

const itemsStore = useItemsStore();
const pathStore = usePathStore();
const tabsStore = useTabsStore();
</script>

<template>
  <div id="filetree" class="relative flex flex-1 flex-col overflow-auto">
    <TransitionGroup name="rows">
      <a
        v-for="(rootValue, rootKey) in roots"
        :key="rootKey"
        :href="`/${rootKey}`"
        tabindex="0"
        draggable="false"
        @drop.stop.prevent="itemsStore.handleDrop($event, rootKey)"
        @click.stop.prevent="pathStore.pushOnTab(`/${rootKey}`)"
      >
        <!--  :class="{ expl-item folder grid grid-cols-2
        'hover:bg-base-200': isThemeLight,
        'hover:bg-base-100/25': !isThemeLight,
      }" -->
        <div class="expl-grid-item is-list folder flex">
          <ExpandButton :path="rootKey" />
          <span class="material-symbols-outlined pointer-events-none">
            {{ rootValue.icon }}
          </span>
          {{ rootValue.name }}
        </div>
        <FileTreeGrid
          v-if="tabsStore.activeTab.expandedPaths?.includes(rootKey)"
          :path="rootKey"
        />
      </a>
    </TransitionGroup>
  </div>
</template>
