<script setup lang="ts">
import { useContextMenuStore } from "@/stores/context-menu";
import { ItemStore } from "@/stores/items/manager";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { useSettingsStore } from "@/stores/settings";
import { useTabsStore } from "@/stores/tabs";
import { getFullPath } from "@/utils/item";
import { clearDragOverStyle, setDragOverStyle } from "@/utils/style";
import { CSSProperties, computed, inject, nextTick, ref, watch } from "vue";
import ExplorerGridHead from "./ExplorerGridHead.vue";
import ExplorerGridItem from "./ExplorerGridItem.vue";
import LoaderIcon from "./LoaderIcon.vue";
import FileTreeGrid from "./filetree/FileTreeGrid.vue";

const isFileTree = inject<boolean>("isFileTree")!;
const isSearch = inject<boolean>("isSearch")!;

const props = defineProps<{ itemStore: ItemStore }>();

const tabsStore = useTabsStore();
const selectionRectStore = useSelectionRectStore();
const settingsStore = useSettingsStore();
const contextMenuStore = useContextMenuStore();

const explBodyDiv = ref<HTMLDivElement | null>(null);
const rectElDiv = ref<HTMLDivElement | null>(null);
const scrollTop = ref(0); // for ExplorerGridHead shadow
const preventTransition = ref(false); // between paths
const viewChanged = ref(false); // for transition duration

const view = computed<ExplorerView>(() =>
  isFileTree ? "list" : settingsStore.settings.view,
);
const columnSettings = computed(
  () => settingsStore.settings[isSearch ? "searchColumns" : "columns"],
);
const columnOrder = computed<Partial<keyof ItemCore>[]>(() =>
  view.value == "list" && !isFileTree ? columnSettings.value.order : ["name"],
);
const gridStyle = computed<CSSProperties>(() => ({
  gridTemplateColumns:
    view.value == "list"
      ? columnSettings.value.order
          .map((c) => (c == "name" ? "minmax(10rem, auto)" : "min-content"))
          .join(" ")
      : "repeat(auto-fill, minmax(5rem, 1fr))",
}));

watch(
  [
    () => columnSettings.value.orderBy,
    () => columnSettings.value.orderDesc,
    () => props.itemStore.items,
  ],
  () => {
    const { orderBy, orderDesc } = columnSettings.value;
    props.itemStore.items.sort((a, b) => {
      const desc = orderDesc ? -1 : 1;
      if (a.isFolder && !b.isFolder) return -desc;
      if (!a.isFolder && b.isFolder) return desc;
      if (orderBy == "size") {
        if (!a.size || !b.size) return a.name.localeCompare(b.name) * desc;
        return (a.size - b.size) * desc;
      }
      if (orderBy == "dateAdded" || orderBy == "dateModified")
        return (a[orderBy].getTime() - b[orderBy].getTime()) * desc;
      return (a[orderBy] as string).localeCompare(b[orderBy] as string) * desc;
    });
    nextTick(() => (preventTransition.value = false));
  },
  { immediate: true },
);

let lastSelectedItemIdx = ref(0);
watch(
  () => props.itemStore.path,
  () => {
    lastSelectedItemIdx.value = 0;
    preventTransition.value = true;
  },
  { flush: "pre" },
);

let viewTimeout: NodeJS.Timeout;
watch(view, () => {
  viewChanged.value = true;
  clearTimeout(viewTimeout);
  viewTimeout = setTimeout(() => (viewChanged.value = false), 600);
});

const handleDropOnBody = (e: DragEvent) => {
  if (
    document.body.getAttribute("dragging-items") != props.itemStore.path &&
    !isSearch
  )
    props.itemStore.handleDrop(e);
};
</script>

<template>
  <!-- Initially, CSS Grid was implemented for all views, including the fileTree.
  However, nested subgrids in the fileTree, especially those several levels deep,
  cause significant CSS lag when switching tabs (like, crazy!) - commit e47faf0.
  Surprisingly, the lag is less pronounced when items are loaded for the first time
  (one by one). Generally, CSS Grid performance is still terrible in 2023,
  so Flex is used instead. This adjustment preserves the Grid's visual style,
  but it introduces extra conditional classes that require attention. -->
  <div
    class="flex-1 overflow-x-auto"
    :class="{
      grid: !isFileTree,
      'grid-rows-1': view == 'grid' && !isFileTree,
      'grid-rows-[auto_1fr]': view == 'list' && !isFileTree,
      '!overflow-hidden': isFileTree,
    }"
    :style="isFileTree ? undefined : gridStyle"
  >
    <LoaderIcon v-if="isFileTree" :loading="itemStore.itemsPending" />
    <ExplorerGridHead
      v-if="view == 'list' && !isFileTree"
      :scroll-top="scrollTop"
      :item-store="itemStore"
    />
    <div
      ref="explBodyDiv"
      class="expl-body relative overflow-y-scroll rounded-box"
      :class="{
        'col-span-full grid auto-rows-min grid-cols-[subgrid]': !isFileTree,
        'items-start gap-x-2 gap-y-1': view == 'grid' && !isFileTree,
        '!overflow-hidden': isFileTree,
        'view-changed': viewChanged,
      }"
      :path="itemStore.path"
      @drop.stop.prevent="handleDropOnBody"
      @dragover.stop.prevent="setDragOverStyle"
      @dragleave.stop.prevent="clearDragOverStyle"
      @dragend.stop.prevent="clearDragOverStyle"
      @mousedown.left="
        selectionRectStore.handleLeftMouseDown(
          explBodyDiv,
          rectElDiv,
          itemStore.items,
          isFileTree,
          $event,
        )
      "
      @scroll="scrollTop = explBodyDiv?.scrollTop ?? 0"
      @contextmenu.stop.prevent="
        contextMenuStore.show('explorer', itemStore, $event)
      "
    >
      <TransitionGroup
        :name="!preventTransition ? 'rows' : ''"
        :css="!preventTransition"
      >
        <template v-for="item in itemStore.items" :key="item.id">
          <ExplorerGridItem
            :item="item"
            :item-store="itemStore"
            :view="view"
            :column-order="columnOrder"
            :handle-drop-on-body="handleDropOnBody"
            v-model:last-selected-item-idx="lastSelectedItemIdx"
          />
          <FileTreeGrid
            v-if="
              isFileTree &&
              item.isFolder &&
              tabsStore.activeTab.expandedPaths?.includes(getFullPath(item))
            "
            :path="getFullPath(item)"
            :key="`${item.id}-filetree`"
          />
        </template>
      </TransitionGroup>
      <div
        ref="rectElDiv"
        class="pointer-events-none absolute z-10 border border-primary bg-primary/20"
      ></div>
    </div>
  </div>
</template>

<style>
.expl-item {
  @apply relative cursor-pointer items-center whitespace-nowrap rounded-box;
  & > * {
    pointer-events: none;
  }
  &.is-list > * {
    @apply p-3;
  }
  &.is-grid > * {
    @apply px-1 py-2;
  }
}
body[dragging-items] .expl-item,
.expl-body.dragover .expl-item {
  &:not(.folder) {
    opacity: 0.25;
    transition: opacity 300ms;
  }
}
</style>
