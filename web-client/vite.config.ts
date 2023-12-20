import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // preserve comments: todo remove
      template: {
        compilerOptions: {
          comments: true,
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    minify: true, // Disable minification
    rollupOptions: {
      treeshake: true
    },

  },
  /* build: {
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
