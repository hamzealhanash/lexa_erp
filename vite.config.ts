import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ["babel-plugin-react-compiler", { target: "19" }],
        ],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@/components": path.resolve(__dirname, "./src/frontend/components"),
      "@/lib": path.resolve(__dirname, "./src/frontend/lib"),
      "@/types": path.resolve(__dirname, "./src/global-types.d.ts"),
      "@/frontend": path.resolve(__dirname, "./src/frontend"),
      "@/assets": path.resolve(__dirname, "./src/frontend/assets"),
      "@": path.resolve(__dirname, "./"),
    },
  },
  base: './',
  build: {
    outDir: 'dist/frontend',
  },
  server : {
    port: 5173,
    strictPort: true,
  }
})
