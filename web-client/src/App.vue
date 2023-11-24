<script setup lang="ts">
import ShortDialog from "./components/ShortDialog.vue";
import { watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCurrentUser } from "vuefire";
import ContextMenu from "./components/ContextMenu.vue";

const user = useCurrentUser();
const router = useRouter();
const route = useRoute();

watch(user, async (currentUser) => {
  if (!currentUser) {
    if (route.meta.requiresAuth) return router.push("/login");
    return;
  }
  if (typeof route.query.redirect == "string")
    return router.push(route.query.redirect);
});
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition :name="route.meta.transition">
      <component
        :is="Component"
        class="transition duration-500 absolute top-0 left-0 right-0 bottom-0"
      />
    </Transition>
  </RouterView>
  <ShortDialog />
  <ContextMenu />
</template>

<style>
#app {
  overflow: hidden;
}
.scale-out-enter-from,
.scale-out-leave-to,
.scale-in-enter-from,
.scale-in-leave-to {
  opacity: 0;
}
.scale-out-enter-from,
.scale-in-leave-to {
  transform: scale(1.1);
}
.scale-out-leave-to,
.scale-in-enter-from {
  transform: scale(0.9);
}
</style>
