import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const appDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(appDir, "..");
const modulesDir = resolve(appDir, "node_modules");

export default defineConfig({
  root: projectRoot,
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^react\/jsx-dev-runtime$/, replacement: resolve(modulesDir, "react/jsx-dev-runtime.js") },
      { find: /^react\/jsx-runtime$/, replacement: resolve(modulesDir, "react/jsx-runtime.js") },
      { find: /^react$/, replacement: resolve(modulesDir, "react/index.js") },
      { find: /^react-dom\/client$/, replacement: resolve(modulesDir, "react-dom/client.js") },
      { find: /^react-dom$/, replacement: resolve(modulesDir, "react-dom/index.js") },
    ],
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: { include: ["react", "react-dom/client", "react/jsx-dev-runtime", "react/jsx-runtime"] },
  server: { port: 5173, strictPort: true },
});
