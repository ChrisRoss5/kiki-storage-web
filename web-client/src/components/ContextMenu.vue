<script setup lang="ts">
import { useContextMenuStore } from "@/stores/context-menu";
import { useSettingsStore } from "@/stores/settings";
import defaultSettings, { columnNames } from "@/stores/settings/default";
import { computed, ref, watchPostEffect } from "vue";
import ItemOptions from "./ItemOptions.vue";

const contextMenuStore = useContextMenuStore();
const settingsStore = useSettingsStore();

const ctxmenu = ref<HTMLElement | null>(null);

const isSearch = computed(
  () => contextMenuStore.itemsStore?.$id == "search-items",
);
const activeColumnsOrder = computed(
  () =>
    settingsStore.settings[isSearch.value ? "searchColumns" : "columns"].order,
);
const allColumnsOrder =
  defaultSettings[isSearch.value ? "searchColumns" : "columns"].order;

watchPostEffect(() => {
  const el = ctxmenu.value!;
  let { x, y } = contextMenuStore.position;
  const { offsetWidth, offsetHeight } = el;
  const { innerWidth, innerHeight } = window;
  if (x + offsetWidth + 20 > innerWidth) x = innerWidth - offsetWidth - 20;
  if (y + offsetHeight + 20 > innerHeight) y = innerHeight - offsetHeight - 20;
  el.style.transition = "none";
  el.style.opacity = "0";
  el.style.clipPath = "circle(0% at 0 0)";
  el.style.transform = "translateY(-10px)";
  el.offsetHeight; // nosonar: reflow
  el.style.top = `${y}px`;
  el.style.left = `${x}px`;
  el.style.transition = "opacity 300ms, clip-path 300ms, transform 300ms";
  el.style.opacity = "1";
  el.style.clipPath = "circle(150% at 0 0)";
  el.style.transform = "translateY(0)";
});

const handleColumnChange = (key: keyof ItemCore) => {
  settingsStore.updateSetting(isSearch.value ? "searchColumns" : "columns", {
    order: activeColumnsOrder.value.includes(key)
      ? activeColumnsOrder.value.filter((k) => k != key)
      : [...activeColumnsOrder.value, key],
  });
};
</script>

<template>
  <div
    class="fixed z-20 select-none rounded-btn bg-base-200 shadow-md"
    ref="ctxmenu"
    @click.stop="null"
    @contextmenu.prevent="contextMenuStore.hide"
  >
    <ItemOptions
      v-if="contextMenuStore.activeContextMenu == 'item'"
      class="rounded-btn bg-base-200 shadow-lg"
      :items-store="contextMenuStore.itemsStore!"
      :in-context-menu="true"
      @click="contextMenuStore.hide"
    />
    <div v-else-if="contextMenuStore.activeContextMenu == 'column'">
      <label
        v-for="key in allColumnsOrder"
        :key="key"
        class="flex cursor-pointer items-center rounded-btn px-3 py-2 hover:bg-base-300"
      >
        <input
          type="checkbox"
          class="dsy-checkbox-primary dsy-checkbox dsy-checkbox-sm mr-3"
          @change.prevent="handleColumnChange(key)"
          :checked="activeColumnsOrder.includes(key)"
          :disabled="key == 'name'"
        />
        {{ columnNames[key] }}
      </label>
    </div>
  </div>
</template>
