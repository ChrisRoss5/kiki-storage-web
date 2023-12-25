<script setup lang="ts">
import { provide, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCurrentUser } from "vuefire";
import ContextMenu from "./components/ContextMenu.vue";
import Notification from "./components/Notification.vue";
import ShortDialog from "./components/ShortDialog.vue";
import resetStores from "./stores/reset";
import Home from "./views/Home.vue";
import Login from "./views/Login.vue";

const ghostDragDiv = ref<HTMLDivElement | null>();
provide("ghostDragDiv", ghostDragDiv);

const user = useCurrentUser();
const router = useRouter();
const route = useRoute();

watch(user, async (currentUser) => {
  if (!currentUser) {
    if (!route.meta.requiresAuth) return;
    resetStores();
    return router.push("/login");
  }
  if (typeof route.query.redirect == "string")
    return router.replace(route.query.redirect);
});
</script>

<template>
  <Home class="h-full" />
  <Transition name="fade">
    <Login
      v-if="$route.name == 'login'"
      class="absolute inset-0 z-10"
    />
  </Transition>
  <ShortDialog />
  <ContextMenu />
  <Notification />
  <div
    ref="ghostDragDiv"
    class="absolute -top-full rounded-box bg-base-300 p-3 pl-7"
  ></div>
</template>