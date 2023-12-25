// vite.config.ts
import vue from "file:///C:/Github/DropboxClone/web-client/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { fileURLToPath } from "url";
import { defineConfig } from "file:///C:/Github/DropboxClone/web-client/node_modules/vite/dist/node/index.js";
import mkcert from "file:///C:/Github/DropboxClone/web-client/node_modules/vite-plugin-mkcert/dist/mkcert.mjs";
var __vite_injected_original_import_meta_url = "file:///C:/Github/DropboxClone/web-client/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [vue(), mkcert()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
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
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxHaXRodWJcXFxcRHJvcGJveENsb25lXFxcXHdlYi1jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXEdpdGh1YlxcXFxEcm9wYm94Q2xvbmVcXFxcd2ViLWNsaWVudFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovR2l0aHViL0Ryb3Bib3hDbG9uZS93ZWItY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tIFwidXJsXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCBta2NlcnQgZnJvbSBcInZpdGUtcGx1Z2luLW1rY2VydFwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbdnVlKCksIG1rY2VydCgpXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogZmlsZVVSTFRvUGF0aChuZXcgVVJMKFwiLi9zcmNcIiwgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgLyogYnVpbGQ6IHsgIC8vIEJldHRlciBjb21wcmVzc2lvbiwgbW9yZSB0aW1lIHRvIGJ1aWxkXHJcbiAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXHJcbiAgICBtaW5pZnk6IFwidGVyc2VyXCIsXHJcbiAgICB0ZXJzZXJPcHRpb25zOiB7XHJcbiAgICAgIGNvbXByZXNzOiB7XHJcbiAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLFxyXG4gICAgICAgIGtlZXBfaW5maW5pdHk6IHRydWUsXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LCAqL1xyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2UixPQUFPLFNBQVM7QUFDN1MsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxZQUFZO0FBSDhKLElBQU0sMkNBQTJDO0FBTWxPLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO0FBQUEsRUFDekIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVdGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
