<script setup lang="ts">
import { getPathName } from "@/stores/path";
import { roots } from "@/stores/settings/default";
import { useTabsStore } from "@/stores/tabs";
import { SlickItem, SlickList } from "vue-slicksort";

const tabsStore = useTabsStore();
</script>

<template>
  <SlickList
    class="flex -translate-x-2 select-none px-5 pt-3"
    v-model:list="tabsStore.tabs"
    axis="x"
    lockAxis="x"
    helperClass="slick-tab-dragging"
    :distance="5"
  >
    <TransitionGroup name="expl-tab">
      <SlickItem
        v-for="(tab, i) in tabsStore.tabs"
        tag="a"
        :href="tab.path"
        :key="tab.id"
        :index="i"
        class="rounded-box relative mb-2 ml-2 min-w-0 max-w-[20vw] flex-grow basis-0 cursor-pointer whitespace-nowrap bg-base-200 py-1 text-lg hover:bg-base-300"
        :class="{
          'tab-active !mb-0 cursor-default rounded-b-none !bg-primary/30 pb-3':
            tab.id == tabsStore.activeTab.id,
        }"
        @click.prevent="tabsStore.switchTab(tab)"
      >
        <div class="relative flex gap-1 overflow-hidden pl-3 pr-7">
          <div
            v-if="tab.path in roots"
            class="material-symbols-outlined !text-xl"
          >
            {{ roots[tab.path as keyof typeof roots].icon }}
          </div>
          <div
            v-else
            class="fiv-viv fiv-icon-folder z-10 flex-shrink-0 text-xl"
          ></div>
          <div class="mask flex-1 overflow-hidden">
            {{ getPathName(tab.path) }}
          </div>
          <div
            v-if="tabsStore.tabs.length > 1"
            class="flex-center absolute -right-1 bottom-0 top-0 z-10 w-10 text-right"
          >
            <div
              class="material-symbols-outlined rounded-badge flex h-6 w-6 cursor-pointer items-center justify-center !text-base hover:bg-base-100/50"
              @click.stop.prevent="tabsStore.deleteTab(tab)"
            >
              close
            </div>
          </div>
        </div>
      </SlickItem>
    </TransitionGroup>
    <div class="flex-center mb-2 ml-3">
      <div
        class="material-symbols-outlined flex-center rounded-badge aspect-square h-full cursor-pointer bg-base-200 !text-xl hover:bg-base-300"
        @click="() => tabsStore.createTab()"
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
    width: var(--rounded-box);
    height: var(--rounded-box);
    bottom: 0;
  }
  &::before {
    right: 100%;
    background-image: radial-gradient(
      circle at 0 0,
      transparent var(--rounded-box),
      oklch(var(--p) / 30%) calc(var(--rounded-box) + 0.03rem)
    );
  }
  &::after {
    left: 100%;
    background-image: radial-gradient(
      circle at 100% 0,
      transparent var(--rounded-box),
      oklch(var(--p) / 30%) calc(var(--rounded-box) + 0.03rem)
    );
  }
  /* The 0.03rem difference is just enough to simulate anti-aliasing! */
}
</style>
