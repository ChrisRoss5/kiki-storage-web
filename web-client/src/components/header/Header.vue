<script setup lang="ts">
import Logo from "@/components/Logo.vue";
import CreateOrUpload from "./CreateOrUpload.vue";
import UserIcon from "./UserIcon.vue";
import Search from "./search/Search.vue";
</script>

<template>
  <div class="flex flex-wrap items-center gap-5 p-5">
    <Logo />
    <CreateOrUpload class="order-1" />
    <Search class="order-1 relative flex-1" @click.stop="null" />
    <UserIcon class="ml-auto self-start order-0 2xl:order-1" />
  </div>
</template>
