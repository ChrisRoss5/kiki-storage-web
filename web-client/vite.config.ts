import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";
import { fileURLToPath } from "url";
import { PluginOption, defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    /* visualizer({
      template: "treemap", // or sunburst
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: "bundle-analysis.html", // will be saved in project's root
    }) as PluginOption, */
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  /* build: {  // Better compression, more time to build
    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        keep_infinity: true,
      }
    }
  }, */
});
