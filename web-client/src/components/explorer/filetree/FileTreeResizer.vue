<script setup lang="ts">
import { useTabsStore } from "@/stores/tabs";
import { inject, onMounted, onUnmounted, ref } from "vue";

const isThemeLight = inject<boolean>("isThemeLight")!;

const props = defineProps<{ fileTreeEl: HTMLElement | null }>();

const tabsStore = useTabsStore();

const isMouseDown = ref(false);
const startX = ref(0);
const startWidth = ref(0);
const newWidth = ref(0);

onMounted(() => {
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("mousemove", handleMouseMove);
});

onUnmounted(() => {
  document.removeEventListener("mouseup", handleMouseUp);
  document.removeEventListener("mousemove", handleMouseMove);
});

const handleMouseDown = (e: MouseEvent) => {
  isMouseDown.value = true;
  startX.value = e.pageX;
  newWidth.value = startWidth.value = props.fileTreeEl!.offsetWidth;
};
const handleMouseUp = () => {
  if (!isMouseDown.value) return;
  isMouseDown.value = false;
  if (newWidth.value != startWidth.value)
    tabsStore.updateActiveTab({ fileTreeWidth: newWidth.value });
};
const handleMouseMove = (e: MouseEvent) => {
  if (!isMouseDown.value) return;
  const diff = e.pageX - startX.value;
  newWidth.value = startWidth.value + diff;
  props.fileTreeEl!.style.width = `${newWidth.value}px`;
};
const handleDblClick = () => {
  tabsStore.updateActiveTab({ fileTreeWidth: 0 });
};
</script>

<template>
  <div
    id="filetree-resizer"
    class="rounded-outward relative z-10 w-3 cursor-ew-resize bg-gradient-to-b"
    :class="{
      'from-base-200 to-base-300': isThemeLight,
      'from-base-100/25 to-base-100/50 shadow-[0_0_50px_0_oklch(var(--p)/30%)]':
        !isThemeLight,
    }"
    :style="{
      '--rounded-bg': isThemeLight
        ? 'oklch(var(--b2))'
        : 'oklch(var(--b1) / 0.25)',
    }"
    @mousedown="handleMouseDown"
    @dblclick="handleDblClick"
  ></div>
</template>

<style>
#filetree-resizer {
  &::before {
    right: 100%;
    background-image: radial-gradient(
      circle at 0 100%,
      transparent var(--rounded-box),
      var(--rounded-bg) calc(var(--rounded-box) + 0.03rem)
    );
  }
  &::after {
    left: 100%;
    background-image: radial-gradient(
      circle at 100% 100%,
      transparent var(--rounded-box),
      var(--rounded-bg) calc(var(--rounded-box) + 0.03rem)
    );
  }
}
</style>
