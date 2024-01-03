<script setup lang="ts">
import { fileIconVectors } from "@/main";
import { ItemStore } from "@/stores/items/manager";
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
  if (props.item.isFolder) return fileIconVectors["folder"];
  return fileIconVectors[props.item.type] ?? fileIconVectors["blank"];
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
  <input
    v-if="props.itemStore.selectedItems.length && $isTouchDevice"
    type="checkbox"
    v-model="item.isSelected"
    class="cbx-select dsy-checkbox align-text-bottom"
    @click.stop="null"
  />
  <div class="relative flex-shrink-0">
    <div
      v-if="item.isStarred"
      class="star star-active material-symbols-outlined text-yellow-300"
      :class="{ grid: view == 'grid' }"
    >
      star
    </div>
    <img
      :src="imgSrc"
      class="w-4"
      :class="{ 'w-full px-3': view == 'grid' }"
      alt="Icon"
    />
  </div>
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

<style>
.star {
  position: absolute;
  left: 100%;
  top: 100%;
  transform: scale(0.6) translate(-1.3rem, -1.2rem);
  &.grid {
    transform: translate(-1.5rem, -0.7rem);
  }
}
.cbx-select::after {
  content: "";
  inset: 0;
  position: absolute;
}
</style>
