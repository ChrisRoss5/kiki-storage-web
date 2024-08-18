<script setup lang="ts">
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCurrentUser } from "vuefire";
import resetStores from "./stores/reset";
import Home from "./views/Home.vue";
import Login from "./views/Login.vue";

const user = useCurrentUser();
const router = useRouter();
const route = useRoute();

watch(user, async (currentUser) => {
  if (!currentUser) {
    if (!route.meta.requiresAuth) return;
    resetStores();
    return router.replace("/login");
  }
  if (typeof route.query.redirect == "string")
    return router.replace(route.query.redirect);
});
</script>
<template>

  <Home class="h-full" />
  <Transition name="fade">
    <Login v-if="$route.name == 'login'" class="absolute inset-0 z-10" />
  </Transition>
</template>
