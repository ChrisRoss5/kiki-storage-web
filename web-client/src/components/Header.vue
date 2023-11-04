<script setup lang="ts">
import CreateOrUpload from "./CreateOrUpload.vue";
import Search from "@/components/search/Search.vue";
</script>

<template>
  <div class="flex items-center gap-5">
    <RouterLink to="/" class="flex-center text-2xl">
      <img alt="" class="h-14 mr-3" src="/logo.png" />
      Dropbox Clone
    </RouterLink>
    <CreateOrUpload />
    <Search class="relative flex-1" @click.stop="null" />
    <div>
      <img alt="" class="rounded-full h-14" src="@/assets/default-pfp.webp" />
    </div>
  </div>
</template>
