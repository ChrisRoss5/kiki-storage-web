import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";
import { fileURLToPath } from "url";
import { PluginOption, defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      template: "treemap",
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: "bundle-analysis.html",
    }) as PluginOption,
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Kiki Storage",
        short_name: "Kiki Storage",
        icons: [
          {
            src: "logo-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logo-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        display: "standalone",
        description: "Cloud Storage with tabs!",
        theme_color: "#ffffff",
        background_color: "#ffffff",
      },
    }),
    basicSsl(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    https: false,
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
