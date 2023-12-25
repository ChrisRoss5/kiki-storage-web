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
  document.addEventListener("touchend", handleMouseUp);
  document.addEventListener("touchmove", handleMouseMove);
});

onUnmounted(() => {
  document.removeEventListener("mouseup", handleMouseUp);
  document.removeEventListener("mousemove", handleMouseMove);
});

const handleMouseDown = (e: MouseEvent | TouchEvent) => {
  isMouseDown.value = true;
  startX.value = "pageX" in e ? e.pageX : e.touches[0].pageX;
  newWidth.value = startWidth.value = props.fileTreeEl!.offsetWidth;
};
const handleMouseUp = () => {
  if (!isMouseDown.value) return;
  isMouseDown.value = false;
  if (newWidth.value != startWidth.value)
    tabsStore.updateActiveTab({ fileTreeWidth: newWidth.value });
};
const handleMouseMove = (e: MouseEvent | TouchEvent) => {
  if (!isMouseDown.value) return;
  const newX = "pageX" in e ? e.pageX : e.touches[0].pageX;
  newWidth.value = startWidth.value + newX - startX.value;
  props.fileTreeEl!.style.width = `${newWidth.value}px`;
};
const handleDblClick = () => {
  tabsStore.updateActiveTab({ fileTreeWidth: 0 });
};
</script>

<template>
  <div
    id="filetree-resizer"
    class="pr-3"
    @touchstart="handleMouseDown"
    @dblclick="!$breakpoints.mdAndUp && handleDblClick()"
  >
    <div
      id="filetree-resizer-inner"
      class="rounded-outward relative flex h-full w-6 cursor-ew-resize bg-gradient-to-b md:w-3"
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
      v-wave="!$breakpoints.mdAndUp"
    >
      <span class="material-symbols-outlined self-center md:hidden">
        drag_indicator
      </span>
    </div>
  </div>
</template>

<style>
#filetree-resizer-inner {
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
