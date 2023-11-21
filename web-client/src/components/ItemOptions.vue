<script setup lang="ts">
import { useContextMenuStore } from "@/stores/context-menu";
import { ItemsStore } from "@/stores/items";
import { computed } from "vue";

const contextMenuStore = useContextMenuStore();

const props = defineProps<{
  itemsStore: ItemsStore;
  inContextMenu?: boolean;
}>();

type Option = {
  icon: string;
  label: string;
  onClick: () => void;
};
const options = computed<Option[]>(() => [
  {
    icon: "download",
    label: "Download",
    onClick: () => {},
  },
  {
    icon: "share",
    label: "Share",
    onClick: () => {},
  },
  ...(props.itemsStore.selectedItems.length == 1
    ? [
        {
          icon: "edit",
          label: "Rename",
          onClick: () => {
            props.itemsStore.selectedItems[0].isRenaming =
              !props.itemsStore.selectedItems[0].isRenaming;
          },
        },
      ]
    : []),
  {
    icon: "delete",
    label: "Delete",
    onClick: props.itemsStore.deleteItems,
  },
]);

const handleClick = (onClickHandler: () => void) => {
  contextMenuStore.hide();
  onClickHandler();
};
</script>

<template>
  <Transition name="fade">
    <div class="ml-auto flex" v-if="itemsStore.selectedItems.length">
      <div
        v-for="{ icon, label, onClick } in options"
        :key="label"
        class="dsy-tooltip cursor-pointer p-4 hover:bg-base-300"
        :data-tip="label"
        @click.stop="handleClick(onClick)"
        v-wave
      >
        <span class="material-symbols-outlined leading-4"> {{ icon }} </span>
      </div>
    </div>
  </Transition>
</template>
