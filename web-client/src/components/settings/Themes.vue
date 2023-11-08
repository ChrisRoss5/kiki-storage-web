<script setup lang="ts">
const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
] as const;

const setTheme = (theme: (typeof themes)[number]) => {
  console.log(theme);
  document.documentElement.dataset.theme = theme;
};
</script>

<template>
  <div
    class="rounded-box grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
  >
    <div
      v-for="theme in themes"
      :key="theme"
      @click="setTheme(theme)"
      class="border-base-content/20 hover:border-base-content/40 overflow-hidden rounded-lg border outline outline-2 outline-offset-2 outline-transparent"
    >
      <div
        :data-theme="theme"
        class="bg-base-100 text-base-content w-full cursor-pointer font-sans"
      >
        <div class="grid grid-cols-5 grid-rows-3">
          <div class="bg-base-200 col-start-1 row-span-2 row-start-1" />
          <div class="bg-base-300 col-start-1 row-start-3" />
          <div
            class="bg-base-100 col-span-4 col-start-2 row-span-3 row-start-1 flex flex-col gap-1 p-2"
          >
            <div class="font-bold">{{ theme }}</div>
            <div class="flex flex-wrap gap-1">
              <div
                class="bg-primary flex aspect-square w-5 items-center justify-center rounded lg:w-6"
              >
                <div class="text-primary-content text-sm font-bold">A</div>
              </div>
              <div
                class="bg-secondary flex aspect-square w-5 items-center justify-center rounded lg:w-6"
              >
                <div class="text-secondary-content text-sm font-bold">A</div>
              </div>
              <div
                class="bg-accent flex aspect-square w-5 items-center justify-center rounded lg:w-6"
              >
                <div class="text-accent-content text-sm font-bold">A</div>
              </div>
              <div
                class="bg-neutral flex aspect-square w-5 items-center justify-center rounded lg:w-6"
              >
                <div class="text-neutral-content text-sm font-bold">A</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
