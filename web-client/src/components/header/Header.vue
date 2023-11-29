<script setup lang="ts">
import Logo from "@/components/Logo.vue";
import UserIcon from "./UserIcon.vue";
import Search from "./search/Search.vue";
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 py-2 px-5 shadow-md">
    <Logo />
    <Search
      class="relative order-1 flex-1 basis-full lg:basis-auto"
    />
    <UserIcon class="lg:order-1 z-20 order-0 ml-auto self-start" />
  </div>
</template>
