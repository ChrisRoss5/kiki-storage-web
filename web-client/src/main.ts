import "file-icon-vectors/dist/file-icon-vivid.min.css";
import "./styles/main.css"; // do not reorder (keep blank line)!

// https://stackoverflow.com/questions/76247444/why-should-pinia-vuex-be-preferred-over-classic-approach-with-service-classes/76247596#76247596
import { createPinia } from "pinia";
import VWave from "v-wave";
import { createApp } from "vue";
import { plugin as Slicksort } from "vue-slicksort";
import { VueFire, VueFireAuth } from "vuefire";
import App from "./App.vue";
import { firebaseApp } from "./firebase";
import router from "./router";

const pinia = createPinia();
const app = createApp(App);

app
  .use(VueFire, {
    firebaseApp,
    modules: [VueFireAuth()],
  })
  .use(pinia)
  .use(router)
  .use(VWave, {})
  .use(Slicksort)
  .mount("#app");
