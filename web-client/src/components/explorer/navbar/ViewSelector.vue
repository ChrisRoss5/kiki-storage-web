<script setup lang="ts">
import { useSettingsStore } from "@/stores/settings";
import { computed, inject } from "vue";

const isSearch = inject<boolean>("isSearch")!;
const settingsStore = useSettingsStore();
const dbExplorerView = computed(() =>
  isSearch ? settingsStore.settings.searchView : settingsStore.settings.view,
);

interface Button {
  icon: string;
  label: string;
  explorerView: ExplorerView;
}
const buttons: Button[] = [
  {
    icon: "reorder",
    label: "List view",
    explorerView: "list",
  },
  {
    icon: "grid_view",
    label: "Grid view",
    explorerView: "grid",
  },
];
</script>

<template>
  <div>
    <div
      v-for="{ icon, label, explorerView } in buttons"
      :key="label"
      class="dsy-tooltip dsy-tooltip-bottom"
      :data-tip="label"
    >
      <button
        class="dsy-btn"
        :class="{
          'dsy-btn-secondary pointer-events-none':
            explorerView == dbExplorerView,
        }"
        @click="settingsStore.setView(explorerView, isSearch)"
        v-wave
      >
        <span class="material-symbols-outlined"> {{ icon }} </span>
      </button>
    </div>
  </div>
</template>
