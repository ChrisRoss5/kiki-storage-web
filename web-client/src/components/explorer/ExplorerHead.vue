<script setup lang="ts">
import { useContextMenuStore } from "@/stores/context-menu";
import { ItemsStore } from "@/stores/items";
import { useSettingsStore } from "@/stores/settings";
import { columnNames } from "@/stores/settings/default";
import { inject, ref, computed } from "vue";
import { DragHandle, SlickItem, SlickList } from "vue-slicksort";

defineProps<{
  scrollTop: number;
  itemsStore: ItemsStore;
}>();

const isSearch = inject<boolean>("isSearch")!;
const settingsStore = useSettingsStore();
const contextMenuStore = useContextMenuStore();

const isDraggingColumn = ref(false);

const columnSettings = computed(
  () => settingsStore.settings[isSearch ? "searchColumns" : "columns"],
);
let savingNewColumnOrder = false;
const columnOrder = computed({
  get: () => columnSettings.value.order,
  async set(newValue) {
    if (savingNewColumnOrder) return;
    savingNewColumnOrder = true;
    await settingsStore.updateColumns({ order: newValue }, isSearch);
    savingNewColumnOrder = false;
  },
});

const handleColumnClick = (key: keyof ItemCore) => {
  const newColumns: Partial<ColumnSettings> =
    columnSettings.value.orderBy == key
      ? { orderDesc: !columnSettings.value.orderDesc }
      : {
          orderBy: key,
          orderDesc:
            key == "dateAdded" || key == "dateModified" || key == "size",
        };
  settingsStore.updateColumns(newColumns, isSearch);
};
</script>

<template>
  <SlickList
    class="expl-header duration-300] z-[1] col-span-full grid grid-cols-[subgrid] items-center rounded-xl bg-base-100 transition-[box-shadow]"
    :class="{
      'pointer-events-none': isDraggingColumn,
      'shadow-md': scrollTop > 0,
    }"
    v-model:list="columnOrder"
    axis="x"
    lockAxis="x"
    useDragHandle
    helperClass="slick-item-dragging"
    @sort-start="isDraggingColumn = true"
    @sort-end="isDraggingColumn = false"
    @contextmenu.stop.prevent="
      contextMenuStore.show('column', itemsStore, $event)
    "
  >
    <SlickItem
      v-for="(key, i) in columnOrder"
      :key="key"
      :index="i"
      class="group relative z-[10] cursor-pointer rounded-xl bg-base-100 p-3 font-bold text-base-content/60 hover:bg-base-200"
      @click.stop="handleColumnClick(key)"
    >
      <DragHandle
        class="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 cursor-grab opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        drag_indicator
      </DragHandle>
      <div
        v-if="columnSettings.orderBy == key"
        class="material-symbols-outlined absolute -top-2 left-1/2 -translate-x-1/2 transition-transform duration-300"
        :class="{ 'scale-y-[-1]': !columnSettings.orderDesc }"
      >
        expand_more
      </div>
      <div
        class="col-name transition-transform duration-300 group-hover:translate-x-3"
      >
        {{ columnNames[key] }}
      </div>
    </SlickItem>
  </SlickList>
</template>

<style>
.slick-item-dragging {
  @apply cursor-grabbing bg-base-200;
  & .material-symbols-outlined {
    opacity: 1;
  }
  & .col-name {
    @apply translate-x-3;
  }
}
</style>
