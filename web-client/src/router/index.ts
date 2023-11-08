import { createRouter, createWebHashHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";

const routes = [
  { path: "/login", component: Login, meta: { transition: "scale-out" } },
  {
    path: "/drive",
    component: Home,
    meta: { transition: "scale-in" },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/drive",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
