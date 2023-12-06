<script setup lang="ts">
defineProps<{ isLogin?: boolean }>(); // because theme is unknown
</script>

<template>
  <RouterLink to="/" class="flex-center text-2xl" tabindex="-1">
    <img alt="Logo" class="mr-3 h-14" src="/logo.png" />
    <div>
      Dropbox Clone
      <div
        class="ml-1 text-right text-xs"
        :class="{
          '!text-base-content/50': isLogin !== true,
          'text-gray-500': isLogin,
        }"
      >
        ...but nothing like it
      </div>
    </div>
  </RouterLink>
</template>
