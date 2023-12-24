<script setup lang="ts">
import { useNotificationStore } from "@/stores/notification";

const store = useNotificationStore();
</script>

<template>
  <Transition name="slide-down">
    <div
      v-if="store.message"
      class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral text-neutral-content p-5 z-[999] rounded-box shadow-xl"
    >
      <span v-if="store.isLoading" class="dsy-loading dsy-loading-spinner w-4"></span>
      {{ store.message }}
    </div>
  </Transition>
</template>

<style scoped>
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translate(-50%, calc(-50% - 0.5rem));
}
.slide-down-leave-to {
  transform : translate(-50%, calc(-50% + 0.5rem));
}
</style>