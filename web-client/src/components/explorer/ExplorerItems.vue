<script setup lang="ts">
import { ItemsStore } from "@/stores/items";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { formatDate, formatSize } from "@/utils/format";
import { computed, nextTick, ref, watch } from "vue";

const props = defineProps<{
  isSearch: boolean;
  item: Item;
  itemsStore: ItemsStore;
  columnName: keyof ItemCore;
  view: ExplorerView;
}>();

const selectionRectStore = useSelectionRectStore();
const renameInput = ref<HTMLInputElement | null>(null);
const showFullText = computed(
  () =>
    props.item.isSelected &&
    props.itemsStore.selectedItems.length == 1 &&
    !selectionRectStore.isActive,
);

watch(
  () => props.item.isRenaming,
  async (item) => {
    if (!item || !renameInput.value) return;
    props.item.newName = props.item.name;
    renameInput.value.focus();
    await nextTick();
    renameInput.value.select();
  },
  { flush: "post" },
);
</script>

<template>
  <template v-if="columnName == 'name'">
    <div
      class="fiv-viv flex-shrink-0 text-xl"
      :class="
        item.isFolder
          ? 'fiv-icon-folder'
          : `fiv-icon-blank fiv-icon-${item.type}`
      "
    ></div>
    <div
      v-if="item.isRenaming"
      class="ml-2 inline-flex"
      @mousedown.stop="null"
      @click.stop.prevent="null"
    >
      <input
        ref="renameInput"
        v-model.trim="item.newName"
        type="text"
        :placeholder="`Enter a new ${item.isFolder ? 'folder' : 'file'} name`"
        class="dsy-input dsy-join-item dsy-input-secondary outline-none"
        @keyup.enter.stop="itemsStore.renameItem(item)"
        @keydown.esc.stop="item.isRenaming = false"
        spellcheck="false"
        autocomplete="off"
      />
      <button
        class="dsy-btn dsy-btn-secondary dsy-join-item"
        :class="{ 'dsy-btn-disabled': !item.newName }"
        @click="itemsStore.renameItem(item)"
        v-wave
      >
        <span class="material-symbols-outlined"> check </span>
      </button>
      <button
        class="dsy-btn dsy-btn-secondary dsy-join-item"
        @click="item.isRenaming = false"
        v-wave
      >
        <span class="material-symbols-outlined"> close </span>
      </button>
    </div>
    <div class="w-full overflow-hidden" v-else>
      <div
        class="overflow-hidden text-ellipsis whitespace-pre"
        :class="{
          'whitespace-pre-wrap': view == 'grid' || showFullText,
          'line-clamp-3': view == 'grid' && !showFullText,
        }"
      >
        {{ item.name + (item.type ? `.${item.type}` : "") }}
      </div>
      <div class="overflow-hidden text-ellipsis font-bold" v-if="isSearch">
        Path: Personal drive/{{ item.path }}
      </div>
    </div>
  </template>
  <template v-else-if="columnName == 'size'">
    {{ item.isFolder ? "" : formatSize(item.size!) }}
  </template>
  <template v-else-if="columnName == 'type'">
    {{ item.isFolder ? "Folder" : item.type.toUpperCase() }}
  </template>
  <template v-else-if="columnName == 'dateAdded'">
    {{ formatDate(item.dateAdded, "hr") }}
  </template>
  <template v-else-if="columnName == 'dateModified'">
    {{ formatDate(item.dateModified, "hr") }}
  </template>
</template>
