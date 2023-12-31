<script setup lang="ts">
import { useNotificationStore } from "@/stores/notification";

const store = useNotificationStore();
</script>

<template>
  <Transition name="fade">
    <div
      v-if="store.notifications.length"
      class="pointer-events-none fixed left-1/2 top-1/2 z-[999] -translate-x-1/2 -translate-y-1/2 opacity-80"
    >
      <TransitionGroup name="slide-up">
        <div
          v-for="notif in store.notifications"
          class="mt-2 rounded-box bg-neutral p-5 text-neutral-content shadow-xl"
          :key="notif.id"
        >
          <span
            v-if="notif.isLoading"
            class="dsy-loading dsy-loading-spinner w-4"
          ></span>
          {{ notif.message }}
        </div>
      </TransitionGroup>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-move {
  transition: transform 300ms;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 300ms,
    opacity 300ms;
}
.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
