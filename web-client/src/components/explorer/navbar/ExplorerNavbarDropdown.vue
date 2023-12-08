<script setup lang="ts">
import { getPathName, usePathStore } from "@/stores/path";
import { RootKey, roots } from "@/stores/settings/default";

const pathStore = usePathStore();

defineProps<{
  showRootsDropdown: boolean;
}>();
</script>

<template>
  <div
    class="dsy-dropdown absolute left-0 top-full min-w-full"
    :class="{ 'dsy-dropdown-open': showRootsDropdown }"
  >
    <ul
      tabindex="0"
      class="dsy-menu dsy-dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow"
    >
      <li>
        <a
          v-for="root in Object.keys(roots).filter(
            (r) => r != pathStore.currentRoot,
          )"
          :key="root"
          :href="`/${root}`"
          class="rounded-btn px-1 py-3 text-xl"
          @click.prevent="pathStore.pushOnTab(root)"
          v-wave
          draggable="false"
        >
          <span class="material-symbols-outlined !align-text-bottom">
            {{ roots[root as RootKey]?.icon }} </span
          >{{ getPathName(root) }}
        </a>
      </li>
    </ul>
  </div>
</template>
