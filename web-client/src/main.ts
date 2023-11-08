import "file-icon-vectors/dist/file-icon-vivid.min.css";
import { createPinia } from "pinia";
import VWave from "v-wave";
import { createApp } from "vue";
import "./styles/main.css";
import router from "./router";
import { VueFire, VueFireAuth } from "vuefire";
import App from "./App.vue";
import { firebaseApp } from "./firebase";

// import Toast, { PluginOptions } from "vue-toastification"; todo: add toast

const pinia = createPinia();
const app = createApp(App);

app
  .use(VueFire, {
    firebaseApp,
    modules: [VueFireAuth()],
  })
  .use(pinia)
  .use(VWave, {})
  .use(router)
  .mount("#app");
