import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import { createRouter, createWebHistory } from "vue-router";
import { getCurrentUser } from "vuefire";

const routes = [
  {
    path: "/login",
    component: Login,
    meta: { transition: "scale-out", requiresAuth: false },
  },
  {
    path: "/",
    redirect: "/drive",
    meta: { transition: "scale-in", requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    component: Home,
    meta: { transition: "scale-in", requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const currentUser = await getCurrentUser();
  if (to.meta.requiresAuth) {
    if (!currentUser)
      return {
        path: "/login",
        ...(to.fullPath != "/drive"
          ? { query: { redirect: to.fullPath } }
          : {}),
      };
  } else if (currentUser) return { path: "/" };
});

export default router;
