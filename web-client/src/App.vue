<script setup lang="ts">
import { getActivePinia } from "pinia";
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCurrentUser } from "vuefire";
import ContextMenu from "./components/ContextMenu.vue";
import ShortDialog from "./components/ShortDialog.vue";

const user = useCurrentUser();
const router = useRouter();
const route = useRoute();

const startupTranstion = ref(false);
onMounted(() => setTimeout(() => (startupTranstion.value = true), 1000));

watch(user, async (currentUser) => {
  if (!currentUser) {
    if (!route.meta.requiresAuth) return;
    resetAllStores();
    return router.push("/login");
  }
  if (typeof route.query.redirect == "string")
    return router.replace(route.query.redirect);
});

const resetAllStores = () => {
  // https://pinia.vuejs.org/api/interfaces/pinia._StoreWithState.html#-reset
  // https://github.com/vuejs/pinia/discussions/1859
  try {
    (getActivePinia() as any)._s.forEach((store: any) => {
      try {
        store.$reset();
      } catch (e) {}
    });
  } catch (e) {
    location.reload();
  }
};
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition
      :name="startupTranstion ? route.meta.transition : ''"
      :css="startupTranstion"
    >
      <component
        :is="Component"
        class="duration-500 absolute bottom-0 left-0 right-0 top-0 transition-[transform,opacity]"
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
