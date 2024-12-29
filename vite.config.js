import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"), // Entry file for the library
      name: "goman-live", // Name of the global variable for UMD build
      fileName: (format) => `goman-live.${format}.js`, // Output filename format
    },
    rollupOptions: {
      // Make sure to externalize dependencies that shouldn't be bundled
      external: ["node-fetch", "base64-js", "ws"], // List your external dependencies here
      output: {
        globals: {
          "node-fetch": "fetch", // Global variable name for UMD/IIFE bundles
          "base64-js": "base64js",
          ws: "WebSocket",
        },
      },
    },
  },
});
