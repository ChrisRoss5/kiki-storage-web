<script setup lang="ts">
import { getPathName } from "@/stores/path";
import { useSettingsStore } from "@/stores/settings";
import { RootKey, roots } from "@/stores/settings/default";
import { useTabsStore } from "@/stores/tabs";
import { computed, ref, watch } from "vue";
import { SlickItem, SlickList } from "vue-slicksort";

const tabsStore = useTabsStore();
const settingsStore = useSettingsStore();

const isThemeLight = computed(() => settingsStore.settings.theme == "light");

const addTabDiv = ref<HTMLDivElement | null>(null);

const scrollingToEnd = ref(false);
const handleCreateTab = () => {
  tabsStore.createTab();
  scrollingToEnd.value = true;
  scrollToEnd();
};

const scrollToEnd = () => {
  const slickListContainer = addTabDiv.value!.parentElement!;
  slickListContainer.scrollTo({ left: slickListContainer.scrollWidth });
  if (scrollingToEnd.value) window.requestAnimationFrame(scrollToEnd);
};

watch(
  () => tabsStore.activeTab.id,
  () => {
    const slickListContainer = addTabDiv.value!.parentElement!;
    const activeTab = slickListContainer.children[
      tabsStore.tabs.indexOf(tabsStore.activeTab)
    ] as HTMLDivElement;
    activeTab.scrollIntoView({ behavior: "smooth", inline: "center" });
  },
  { flush: "post" },
);
</script>

<template>
  <SlickList
    ref="slickListComp"
    class="hidden-scrollbar overflow-x-auto flex -translate-x-2 select-none px-5 pt-3"
    :class="{
      'mb-2 border-b-[0.25rem] border-base-300': isThemeLight,
    }"
    v-model:list="tabsStore.tabs"
    axis="x"
    lockAxis="x"
    helperClass="slick-tab-dragging"
    :distance="$breakpoints.mdAndUp ? 5 : 0"
    :pressDelay="$breakpoints.mdAndUp ? 0 : 400"
  >
    <TransitionGroup name="tabs" @after-enter="scrollingToEnd = false">
      <SlickItem
        v-for="(tab, i) in tabsStore.tabs"
        :tag="$breakpoints.mdAndUp ? 'a' : 'div'"
        :href="tab.path"
        :key="tab.id"
        :index="i"
        class="relative mb-2 ml-2 min-w-[30vw] flex-grow basis-0 cursor-pointer whitespace-nowrap rounded-box bg-base-200 py-1 text-lg hover:bg-base-300 md:min-w-0 md:max-w-[20vw]"
        :class="{
          'tab-active rounded-outward !mb-0 cursor-default rounded-b-none pb-3':
            tab.id == tabsStore.activeTab.id,
        }"
        :style="{
          '--tab-bg': isThemeLight
            ? 'oklch(var(--b3))'
            : 'oklch(var(--p) / 30%)',
        }"
        draggable="false"
        @auxclick.prevent.middle="tabsStore.deleteTab(tab)"
        @click.prevent="tabsStore.switchTab(tab)"
        @dragover="tabsStore.switchTab(tab)"
      >
        <div class="relative flex gap-1 overflow-hidden pl-3 pr-7">
          <div
            v-if="tab.path in roots"
            class="material-symbols-outlined !text-xl"
          >
            {{ roots[tab.path as RootKey]?.icon }}
          </div>
          <div
            v-else
            class="fiv-viv fiv-icon-folder z-10 flex-shrink-0 text-xl"
          ></div>
          <div class="tab-mask flex-1 overflow-hidden">
            {{ getPathName(tab.path) }}
          </div>
          <div
            v-if="tabsStore.tabs.length > 1"
            class="flex-center absolute -right-1 bottom-0 top-0 z-10 w-10 text-right"
          >
            <div
              class="material-symbols-outlined flex h-6 w-6 cursor-pointer items-center justify-center rounded-badge !text-base"
              :class="{
                'hover:bg-base-100': isThemeLight,
                'hover:bg-base-100/50': !isThemeLight,
              }"
              @click.stop.prevent="tabsStore.deleteTab(tab)"
              v-wave
            >
              close
            </div>
          </div>
        </div>
      </SlickItem>
    </TransitionGroup>
    <div class="flex-center mb-2 ml-4" ref="addTabDiv">
      <div
        class="material-symbols-outlined flex-center aspect-square h-full cursor-pointer rounded-badge bg-base-200 !text-xl hover:bg-base-300"
        @click="handleCreateTab"
        v-wave
      >
        add
      </div>
    </div>
  </SlickList>
</template>

<style>
.tabs-enter-active,
.tabs-leave-active {
  transition-property: flex, max-width, min-width;
  transition-duration: 300ms;
}
.tabs-enter-active > div,
.tabs-leave-active > div {
  transition: padding 300ms;
}
.tabs-enter-from,
.tabs-leave-to {
  flex: 0;
  min-width: 0;
  @screen md {
    max-width: 0;
  }
}
.tabs-enter-from > div,
.tabs-leave-to > div {
  padding: 0;
}
.slick-tab-dragging {
  @apply cursor-grabbing bg-base-300;
}
.tab-mask {
  mask-image: linear-gradient(
    to right,
    rgb(0, 0, 0) calc(100% - 2rem),
    transparent
  );
}
.tab-active {
  background-color: var(--tab-bg) !important;
  &::before,
  &::after {
    bottom: 0;
  }
  &::before {
    right: 100%;
    background-image: radial-gradient(
      circle at 0 0,
      transparent var(--rounded-box),
      var(--tab-bg) calc(var(--rounded-box) + 0.03rem)
    );
  }
  &::after {
    left: 100%;
    background-image: radial-gradient(
      circle at 100% 0,
      transparent var(--rounded-box),
      var(--tab-bg) calc(var(--rounded-box) + 0.03rem)
    );
  }
  /* The 0.03rem difference is just enough to simulate anti-aliasing! */
}
</style>
