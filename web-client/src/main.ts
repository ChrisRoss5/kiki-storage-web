import "./styles/main.css"; // do not reorder (keep blank line)!

// https://stackoverflow.com/questions/76247444/why-should-pinia-vuex-be-preferred-over-classic-approach-with-service-classes/76247596#76247596
import { useMediaQuery } from "@vueuse/core";
import { createPinia } from "pinia";
import VWave from "v-wave";
import { createApp, reactive } from "vue";
import { plugin as Slicksort } from "vue-slicksort";
import { VueFire, VueFireAuth } from "vuefire";
import App from "./App.vue";
import { firebaseApp } from "./firebase";
import router from "./router";

const app = createApp(App);

export const $breakpoints = reactive({
  mdAndUp: useMediaQuery("(min-width: 768px)"),
  lgAndUp: useMediaQuery("(min-width: 1024px)"),
});
export const $inputMechanism = reactive({
  isCoarse: useMediaQuery("(pointer: coarse)"),
});
export const $pwa = reactive({
  isInstalled: useMediaQuery("(display-mode: standalone)"),
});

app.config.globalProperties.$breakpoints = $breakpoints;
app.config.globalProperties.$inputMechanism = $inputMechanism;
app.config.globalProperties.$pwa = $pwa;

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $breakpoints: typeof $breakpoints;
    $inputMechanism: typeof $inputMechanism;
    $pwa: typeof $pwa;
  }
}

declare global {
  interface Window {
    useFirebaseFunctions: boolean;
  }
}

window.useFirebaseFunctions = false;

app
  .use(VueFire, {
    firebaseApp,
    modules: [VueFireAuth()],
  })
  .use(createPinia())
  .use(router)
  .use(VWave, {})
  .use(Slicksort)
  .mount("#app");

export const fileIconVectors = Object.fromEntries(
  Object.entries(
    import.meta.glob("/node_modules/file-icon-vectors/dist/icons/vivid/*.svg", {
      eager: true,
      as: "url",
    }),
  ).map(([k, v]) => [k.slice(k.lastIndexOf("/") + 1).replace(".svg", ""), v]),
);
