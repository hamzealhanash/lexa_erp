import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
  plugins: [
    electron({
      main: {
        entry: 'src/electron/main.ts',
        vite: {
          define: {
            'process.env.GITHUB_TOKEN': JSON.stringify(env.VITE_GITHUB_READ_TOKEN),
          },
          build: {
            outDir: 'dist/electron',
            rollupOptions: {
              external: [
                'better-sqlite3-multiple-ciphers',
                'electron-store',
                'electron-updater',
                'electron-pos-printer'
              ],
              output: {
                preserveModules: true,
                preserveModulesRoot: 'src/electron',
              },
            },
          },
        },
      },
      preload: {
        input: 'src/electron/preLoad.ts',
        vite: {
          build: {
            outDir: 'dist/electron',
            rollupOptions: {
              output: {
                format: 'cjs',
                entryFileNames: '[name].cjs',
              },
            },
          },
        },
      },
    }),
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
      "@components": path.resolve(__dirname, "./src/frontend/components"),
      "@lib": path.resolve(__dirname, "./src/frontend/lib"),
      "@types": path.resolve(__dirname, "./src/global-types.d.ts"),
      "@/frontend": path.resolve(__dirname, "./src/frontend"),
      "@assets": path.resolve(__dirname, "./src/frontend/assets"),
      "@": path.resolve(__dirname, "./"),
    },
  },
  base: './',
  build: {
    outDir: 'dist/frontend',
  },
  server: {
    port: 5173,
    strictPort: true,
  }
  }
})
