<script setup lang="ts">
import { getPathName } from "@/stores/path";
import { useSettingsStore } from "@/stores/settings";
import { computed } from "vue";
import { SlickItem, SlickList } from "vue-slicksort";

const settingsStore = useSettingsStore();

const activeTabId = computed(() => settingsStore.settings.activeTabId);
const tabs = computed({
  get: () => settingsStore.settings.tabs,
  set: (tabs) => settingsStore.updateSettings({ tabs }),
});

let lastSelectedTabIdBeforeCreate: TabId | null = null;
const createTab = () => {
  lastSelectedTabIdBeforeCreate = activeTabId.value;
  const newTab = { path: "drive", id: crypto.randomUUID() };
  settingsStore.updateSettings({
    activeTabId: newTab.id,
    tabs: [...tabs.value, newTab],
  });
};
const deleteTab = (tab: Tab) => {
  const idx = tabs.value.findIndex((t) => t.id == tab.id);
  settingsStore.updateSettings({
    tabs: tabs.value.filter((t) => t.id != tab.id),
    ...(activeTabId.value == tab.id
      ? {
          activeTabId: tabs.value.some(
            (t) => t.id == lastSelectedTabIdBeforeCreate,
          )
            ? lastSelectedTabIdBeforeCreate!
            : tabs.value.at(idx + 1)?.id ?? tabs.value.at(-2)!.id,
        }
      : {}),
  });
  lastSelectedTabIdBeforeCreate = null;
};
const switchTab = (tab: Tab) => {
  settingsStore.updateSettings({ activeTabId: tab.id });
  lastSelectedTabIdBeforeCreate = null;
};
</script>

<template>
  <SlickList
    class="flex -translate-x-2 select-none px-5 pt-3"
    v-model:list="tabs"
    axis="x"
    lockAxis="x"
    helperClass="slick-tab-dragging"
    :distance="3"
  >
    <TransitionGroup name="expl-tab">
      <SlickItem
        v-for="(tab, i) in tabs"
        :key="tab.id"
        :index="i"
        class="relative mb-2 ml-2 min-w-0 max-w-[20vw] flex-grow basis-0 cursor-pointer whitespace-nowrap rounded-xl bg-base-200 py-1 text-lg hover:bg-base-300"
        :class="{
          'tab-active !mb-0 cursor-default rounded-b-none !bg-primary/30 pb-3':
            tab.id == activeTabId,
        }"
        @click="switchTab(tab)"
      >
        <div class="relative flex gap-1 overflow-hidden pl-3 pr-7">
          <div class="fiv-viv fiv-icon-folder z-10 flex-shrink-0 text-xl"></div>
          <div class="mask flex-1 overflow-hidden">
            {{ getPathName(tab.path) }}
          </div>
          <div
            v-if="tabs.length > 1"
            class="flex-center absolute -right-1 bottom-0 top-0 z-10 w-10 text-right"
          >
            <div
              class="material-symbols-outlined flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-base hover:bg-base-100/50"
              @click.stop="deleteTab(tab)"
            >
              close
            </div>
          </div>
        </div>
      </SlickItem>
    </TransitionGroup>
    <div class="flex-center mb-2 ml-3">
      <div
        class="material-symbols-outlined flex-center aspect-square h-full cursor-pointer rounded-full bg-base-200 text-xl hover:bg-base-300"
        @click="createTab"
      >
        add
      </div>
    </div>
  </SlickList>
</template>

<style>
.expl-tab-enter-active,
.expl-tab-leave-active {
  transition: flex 300ms;
}
.expl-tab-enter-active > div,
.expl-tab-leave-active > div {
  transition: padding 300ms;
}
.expl-tab-leave-active {
  transition-delay: -100ms; /* TODO: FIGURE OUT WHY THERE'S A DELAY! */
}
.expl-tab-enter-from,
.expl-tab-leave-to {
  flex: 0;
}
.expl-tab-enter-from > div,
.expl-tab-leave-to > div {
  padding: 0;
}
.slick-tab-dragging {
  @apply cursor-grabbing bg-base-300;
}
.mask {
  mask-image: linear-gradient(
    to right,
    rgb(0, 0, 0) calc(100% - 2rem),
    transparent
  );
}
.tab-active {
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
      transparent 0.75rem,
      hsl(var(--p) / 30%) 0.78rem
    );
  }
  &::after {
    left: 100%;
    background-image: radial-gradient(
      circle at 100% 0,
      transparent 0.75rem,
      hsl(var(--p) / 30%) 0.78rem
    );
  }
  /* The 0.03rem difference is just enough to simulate anti-aliasing! */
}
</style>
