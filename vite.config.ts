import { defineConfig } from 'vite'
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({
      projects: ["."],
    }),
    basicSsl(),
    viteSingleFile({
      inlinePattern: ["**/*.js"],
      deleteInlinedFiles: true,
    }),
  ],
  server: {
    https: true,
    port: 3000,
  },
  base: "/mod-matrix"
})
