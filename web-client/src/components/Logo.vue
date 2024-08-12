<script setup lang="ts">
defineProps<{ isLogin?: boolean }>(); // because theme is unknown
</script>

<template>
  <RouterLink to="/" class="flex-center text-2xl" tabindex="-1">
    <img
      alt="Logo"
      class="mr h-14 drop-shadow-lg"
      :class="{ 'mr-3 py-1': !isLogin }"
      src="/logo.png"
    />
    <div>
      Kiki Storage
      <!-- Dropbox Clone
      <div
        class="ml-1 text-right text-xs"
        :class="{
          '!text-base-content/50': isLogin !== true,
          'text-gray-500': isLogin,
        }"
      >
        ...but nothing like it
      </div> -->
    </div>
  </RouterLink>
</template>
