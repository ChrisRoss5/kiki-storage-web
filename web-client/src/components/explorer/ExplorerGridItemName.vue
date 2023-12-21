<script setup lang="ts">
import { fileIconVectors } from "@/main";
import { ItemStore } from "@/stores/items";
import { useSelectionRectStore } from "@/stores/selection-rect";
import { computed, inject, nextTick, ref, watch } from "vue";

const props = defineProps<{
  item: Item;
  itemStore: ItemStore;
  view: ExplorerView;
}>();

const isSearch = inject<boolean>("isSearch")!;
const selectionRectStore = useSelectionRectStore();
const renameInput = ref<HTMLInputElement | null>(null);
const showFullText = computed(
  () =>
    props.item.isSelected &&
    props.itemStore.selectedItems.length == 1 &&
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
  <img
    :src="imgSrc"
    class="w-4 flex-shrink-0 text-xl"
    :class="{ 'w-full px-3': view == 'grid' }"
    alt="Icon"
  />
  <div
    v-if="item.isRenaming"
    id="rename-container"
    class="z-[1] inline-flex items-center"
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
      @keyup.enter.stop="itemStore.renameItem(item)"
      @keydown.esc.stop="item.isRenaming = false"
      spellcheck="false"
      autocomplete="off"
    />
    <button
      class="dsy-btn dsy-btn-primary dsy-join-item"
      :class="{ 'dsy-btn-disabled': !item.newName }"
      @click="itemStore.renameItem(item)"
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
