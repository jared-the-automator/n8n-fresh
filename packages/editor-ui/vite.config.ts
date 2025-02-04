import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills({
      include: ["os", "path", "util"]
    })
  ],
  // ... rest of your existing config
});
