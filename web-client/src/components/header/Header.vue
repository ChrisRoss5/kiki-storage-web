<script setup lang="ts">
import Logo from "@/components/Logo.vue";
import CreateOrUpload from "./CreateOrUpload.vue";
import Search from "./search/Search.vue";
</script>

<template>
  <div class="flex items-center gap-5">
    <Logo />
    <CreateOrUpload />
    <Search class="relative flex-1" @click.stop="null" />
    <div>
      <img alt="" class="rounded-full h-14" src="@/assets/default-pfp.webp" />
    </div>
  </div>
</template>
