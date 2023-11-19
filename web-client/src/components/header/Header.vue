<script setup lang="ts">
import Logo from "@/components/Logo.vue";
import CreateOrUpload from "./CreateOrUpload.vue";
import UserIcon from "./UserIcon.vue";
import Search from "./search/Search.vue";
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 p-5 border-b-2 border-base-300 mb-5">
    <Logo />
    <CreateOrUpload class="order-1 basis-full lg:basis-auto" />
    <Search
      class="relative order-2 flex-1 basis-full 2xl:basis-auto"
      @click.stop="null"
    />
    <UserIcon class="order-0 ml-auto self-start lg:order-1 2xl:order-3 z-20" />
  </div>
</template>
