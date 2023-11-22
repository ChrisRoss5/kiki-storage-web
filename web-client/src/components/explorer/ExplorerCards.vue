<script setup lang="ts">
import { ref } from "vue";

const paths = [
  "Home",
  "Desktop",
  "Downloads",
  "Documents",
  "Pictures",
  "Music",
  "Videos",
  "Trash",
];

const activePath = ref("Home");
</script>

<template>
  <div class="flex gap-3 px-5 pt-3 text-lg">
    <div
      v-for="path in paths"
      class="tab relative mb-3 min-w-0 max-w-[20vw] flex-grow basis-0 cursor-pointer whitespace-nowrap rounded-xl bg-base-200 py-1 pl-3 pr-6 hover:bg-base-300"
      :class="{ 'active mb-0 rounded-b-none !bg-primary/10': path == activePath }"
      @click="activePath = path"
    >
      <div class="overflow-hidden text-ellipsis">
        <div class="fiv-viv fiv-icon-folder flex-shrink-0 text-xl"></div>
        {{ path }}
        <!-- close icon -->
        <div class="material-symbols-outlined absolute right-3 top-1 text-base">
          close
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab.active {
  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 0.75rem;
    height: 0.75rem;
    bottom: 0;
  }
  &::before {
    right: 100%;
    background-image: radial-gradient(
      circle at 0 0,
      transparent 0,
      transparent 0.75rem,
      hsl(var(--p) / 10%) 0
    );
  }
  &::after {
    left: 100%;
    background-image: radial-gradient(
      circle at 100% 0,
      transparent 0,
      transparent 0.75rem,
      hsl(var(--p) / 10%) 0
    );
  }
}
</style>
