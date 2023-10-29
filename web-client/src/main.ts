import "file-icon-vectors/dist/file-icon-vivid.min.css";
import { createPinia } from "pinia";
import VWave from "v-wave";
import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import App from "./App.vue";
import "./styles/main.css";
import Home from "./views/Home.vue";
import Login from "./views/Login.vue";
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
const pinia = createPinia();
const app = createApp(App);

app.use(pinia).use(VWave, {}).use(router).mount("#app");
