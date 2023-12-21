<script setup lang="ts">
import { useContextMenuStore } from "@/stores/context-menu";
import { useSettingsStore } from "@/stores/settings";
import getDefaultSettings, { columnNames } from "@/stores/settings/default";
import { computed, ref, watchPostEffect } from "vue";
import ItemOptions from "./ItemOptions.vue";

const contextMenuStore = useContextMenuStore();
const settingsStore = useSettingsStore();

const ctxmenu = ref<HTMLElement | null>(null);

const isSearch = computed(
  () => contextMenuStore.itemStore?.$id == "search-items",
);
const columnSettings = computed(
  () => settingsStore.settings[isSearch.value ? "searchColumns" : "columns"],
);
const allColumnsOrder =
  getDefaultSettings()[isSearch.value ? "searchColumns" : "columns"].order;

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
  el.style.transition = "opacity 400ms, clip-path 400ms, transform 400ms";
  el.style.opacity = "1";
  el.style.clipPath = "circle(170% at 0 0)";
  el.style.transform = "translateY(0)";
});

const handleColumnChange = (key: keyof ItemCore) => {
  settingsStore.updateSetting(isSearch.value ? "searchColumns" : "columns", {
    order: columnSettings.value.order.includes(key)
      ? columnSettings.value.order.filter((k) => k != key)
      : [...columnSettings.value.order, key],
  });
};
</script>

<template>
  <div
    class="fixed z-20 select-none rounded-box bg-base-200 shadow-md"
    ref="ctxmenu"
    @click.stop="null"
    @contextmenu.prevent="contextMenuStore.hide"
  >
    <ItemOptions
      v-if="contextMenuStore.activeContextMenu == 'item'"
      class="rounded-box bg-base-200 shadow-lg"
      :item-store="contextMenuStore.itemStore!"
      :in-context-menu="true"
      @click="contextMenuStore.hide"
    />
    <div v-else-if="contextMenuStore.activeContextMenu == 'column'">
      <label
        v-for="key in allColumnsOrder"
        :key="key"
        class="flex cursor-pointer items-center rounded-box px-3 py-2 hover:bg-base-300"
      >
        <input
          type="checkbox"
          class="dsy-checkbox-primary dsy-checkbox dsy-checkbox-sm mr-3"
          @change.prevent="handleColumnChange(key)"
          :checked="columnSettings.order.includes(key)"
          :disabled="key == 'name'"
        />
        {{ columnNames[key] }}
      </label>
    </div>
    <div v-else-if="contextMenuStore.activeContextMenu == 'explorer'">
      <div
        v-for="key in allColumnsOrder"
        :key="key"
        class="relative flex cursor-pointer items-center rounded-box px-3 py-2 hover:bg-base-300"
        @click="settingsStore.updateColumnOrder(key, isSearch)"
      >
        <div
          v-if="columnSettings.orderBy == key"
          class="material-symbols-outlined absolute -top-2 left-1/2 -translate-x-1/2 transition-transform"
          :class="{ 'scale-y-[-1]': !columnSettings.orderDesc }"
        >
          expand_more
        </div>
        <div>
          {{ columnNames[key] }}
        </div>
      </div>
    </div>
  </div>
</template>
