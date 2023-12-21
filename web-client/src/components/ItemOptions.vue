<script setup lang="ts">
import { useContextMenuStore } from "@/stores/context-menu";
import { ItemsStore } from "@/stores/items";
import { useItemsStorageStore } from "@/stores/items/firebase/storage";
import { useSettingsStore } from "@/stores/settings";
import { useShortDialogStore } from "@/stores/short-dialog";
import { useTabsStore } from "@/stores/tabs";
import { getFullPath } from "@/utils/item";
import { computed } from "vue";

const contextMenuStore = useContextMenuStore();
const settingsStore = useSettingsStore();
const itemsStorageStore = useItemsStorageStore();
const dialogStore = useShortDialogStore();
const tabsStore = useTabsStore();

const isThemeLight = computed(() => settingsStore.settings.theme == "light");
const firstItem = computed(() => props.itemsStore.selectedItems[0]);

const props = defineProps<{
  itemsStore: ItemsStore;
  inContextMenu?: boolean;
}>();

type Option = {
  icon: string;
  label: string;
  onClick: () => void;
  showCondition?: () => boolean;
};
const options = computed<Option[]>(() =>
  [
    {
      icon: "open_in_new",
      label: "Open in new tab",
      onClick: () => {
        tabsStore.createTab(getFullPath(firstItem.value));
      },
      showCondition: () =>
        props.itemsStore.selectedItems.length == 1 && firstItem.value.isFolder,
    },
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
    {
      icon: "edit",
      label: "Rename",
      onClick: () => {
        firstItem.value.isRenaming = true;
      },
      showCondition: () => props.itemsStore.selectedItems.length == 1,
    },
    {
      icon: props.itemsStore.root == "bin" ? "delete_forever" : "delete",
      label: props.itemsStore.root == "bin" ? "Delete permanently" : "Delete",
      onClick: props.itemsStore.deleteItems,
    },
  ].filter((option) => !option.showCondition || option.showCondition()),
);

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
@/stores/items/firebase/storage
