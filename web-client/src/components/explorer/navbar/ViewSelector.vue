<script setup lang="ts">
import { useSettingsStore } from "@/stores/settings";
import { computed, inject } from "vue";

const isSearch = inject<boolean>("isSearch")!;
const settingsStore = useSettingsStore();
const dbView = computed(
  () => settingsStore.settings[isSearch ? "searchView" : "view"],
);

interface Button {
  icon: string;
  label: string;
  view: ExplorerView;
}
const buttons: Button[] = [
  {
    icon: "reorder",
    label: "List view",
    view: "list",
  },
  {
    icon: "grid_view",
    label: "Grid view",
    view: "grid",
  },
];
</script>

<template>
  <div>
    <div
      v-for="{ icon, label, view } in buttons"
      :key="label"
      class="dsy-tooltip dsy-tooltip-bottom"
      :data-tip="label"
    >
      <button
        class="dsy-btn"
        :class="{
          'dsy-btn-secondary pointer-events-none': view == dbView,
          'border-none bg-base-100/25': view != dbView,
        }"
        @click="
          settingsStore.setSetting(isSearch ? 'searchView' : 'view', view)
        "
        v-wave
      >
        <span class="material-symbols-outlined"> {{ icon }} </span>
      </button>
    </div>
  </div>
</template>
