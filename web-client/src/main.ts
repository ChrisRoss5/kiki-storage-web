import { createApp } from "vue";
import App from "./App.vue";
import VWave from "v-wave";
import Login from "./views/Login.vue";
import Home from "./views/Home.vue";
import "./styles/main.css";
import "file-icon-vectors/dist/file-icon-vivid.min.css";
import { createRouter, createWebHashHistory } from "vue-router";
// import Toast, { PluginOptions } from "vue-toastification"; todo: add toast

const routes = [
  { path: "/login", component: Login, meta: { transition: "scale-out" } },
  {
    path: "/:pathMatch(.*)*",
    component: Home,
    meta: { transition: "scale-in" },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);

app.use(VWave, {}).use(router).mount("#app");
