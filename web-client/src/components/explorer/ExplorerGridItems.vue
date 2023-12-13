<script setup lang="ts">
import { ItemsStore } from "@/stores/items";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { formatDate, formatSize } from "@/utils/format";
import { computed, nextTick, ref, watch } from "vue";
import { fileIconVectors } from "@/main";

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
const imgSrc = computed(() => {
  let path = "/node_modules/file-icon-vectors/dist/icons/vivid/";
  if (props.item.isFolder) path += "folder.svg";
  else if (!(path + `${props.item.type}.svg` in fileIconVectors))
    path += "blank.svg";
  else path += `${props.item.type}.svg`;
  return fileIconVectors[path];
});

watch(
  () => props.item.isRenaming,
  async (item) => {
    if (!item || !renameInput.value) return;
    props.item.newName = props.item.name;
    await nextTick();
    renameInput.value.select();
  },
  { flush: "post" },
);
</script>

<template>
  <template v-if="columnName == 'name'">
    <img
      :src="imgSrc"
      class="fiv-viv flex-shrink-0 text-xl"
      :class="{ 'w-full px-3': view == 'grid' }"
      alt="Icon"
    />
    <div
      v-if="item.isRenaming"
      id="rename-container"
      class="inline-flex items-center z-[1]"
      :class="{
        'justify-center text-center': view == 'grid',
        'ml-2': view == 'list',
      }"
      @mousedown.stop="null"
      @click.stop.prevent="null"
    >
      <input
        ref="renameInput"
        v-model.trim="item.newName"
        type="text"
        :placeholder="`Enter a new ${item.isFolder ? 'folder' : 'file'} name`"
        class="dsy-input dsy-join-item dsy-input-primary outline-none"
        :class="{ 'max-w-[calc(100%+2rem)] !p-0 text-center': view == 'grid' }"
        @keyup.enter.stop="itemsStore.renameItem(item)"
        @keydown.esc.stop="item.isRenaming = false"
        spellcheck="false"
        autocomplete="off"
      />
      <button
        class="dsy-btn dsy-btn-primary dsy-join-item"
        :class="{ 'dsy-btn-disabled': !item.newName }"
        @click="itemsStore.renameItem(item)"
        v-wave
      >
        <span class="material-symbols-outlined"> check </span>
      </button>
    </div>
    <div class="w-full overflow-hidden" v-else>
      <div
        class="overflow-hidden text-ellipsis whitespace-pre break-words"
        :class="{
          'whitespace-pre-wrap': view == 'grid' || showFullText,
          'line-clamp-3': view == 'grid' && !showFullText,
        }"
      >
        {{ `${item.name}${item.type ? `.${item.type}` : ""}` }}
      </div>
      <div
        class="overflow-hidden text-ellipsis font-bold"
        v-if="isSearch && view == 'list'"
      >
        Path: {{ item.path }}
      </div>
    </div>
  </template>
  <template v-else-if="columnName == 'size'">
    {{ item.isFolder ? "" : formatSize(item.size) }}
  </template>
  <template v-else-if="columnName == 'type'">
    {{ item.isFolder ? "Folder" : item.type.toUpperCase() }}
  </template>
  <template v-else-if="columnName == 'dateAdded'">
    {{ formatDate(item.dateAdded) }}
  </template>
  <template v-else-if="columnName == 'dateModified'">
    {{ formatDate(item.dateModified) }}
  </template>
</template>
