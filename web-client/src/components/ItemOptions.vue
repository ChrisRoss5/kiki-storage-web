<script setup lang="ts">
import { useContextMenuStore } from "@/stores/context-menu";
import { ItemsStore } from "@/stores/items";
import { useItemsStorageStore } from "@/stores/items/storage";
import { usePathStore } from "@/stores/path";
import { useSettingsStore } from "@/stores/settings";
import { useShortDialogStore } from "@/stores/short-dialog";
import { computed } from "vue";

const contextMenuStore = useContextMenuStore();
const settingsStore = useSettingsStore();
const itemsStorageStore = useItemsStorageStore();
const dialogStore = useShortDialogStore();
const pathStore = usePathStore();

const isThemeLight = computed(() => settingsStore.settings.theme == "light");

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
    onClick: () => {
      if (props.itemsStore.selectedItems.some((i) => i.isFolder))
        return dialogStore.showError(
          "Downloading folders is not supported yet.",
        );
      props.itemsStore.selectedItems.forEach(
        itemsStorageStore.api.downloadFile,
      );
    },
  },
  {
    icon: "share",
    label: "Share",
    onClick: () => {
      dialogStore.showError("Sharing is not supported yet.");
    },
  },
  ...(props.itemsStore.selectedItems.length == 1
    ? [
        {
          icon: "edit",
          label: "Rename",
          onClick: () => {
            props.itemsStore.selectedItems[0].isRenaming = true;
          },
        },
      ]
    : []),
  {
    icon: pathStore.currentRoot == "bin" ? "delete_forever" : "delete",
    label: pathStore.currentRoot == "bin" ? "Delete permanently" : "Delete",
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
        class="dsy-tooltip cursor-pointer p-4"
        :class="{
          'hover:bg-base-100': isThemeLight,
          'hover:bg-base-100/50': !isThemeLight && !inContextMenu,
          'hover:bg-base-content/20': !isThemeLight && inContextMenu,
          'rounded-box': inContextMenu,
        }"
        :data-tip="label"
        @click.stop="handleClick(onClick)"
        v-wave
      >
        <span class="material-symbols-outlined leading-4"> {{ icon }} </span>
      </div>
    </div>
  </Transition>
</template>
