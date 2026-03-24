// Конфиг Vite: несколько HTML-точек входа для сборки всех вкладок сайта
import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  // Относительные пути к ассетам — удобно открывать dist без корневого домена
  base: './',
  // Отдельный порт, чтобы не открывался чужой проект на 5173
  // Порт 5173 часто занят другим Vite — отдельный порт для этого проекта
  server: {
    port: 24680,
    strictPort: false,
    open: '/index.html',
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        format: resolve(__dirname, 'format.html'),
        awaiting: resolve(__dirname, 'awaiting.html'),
        tariffs: resolve(__dirname, 'tariffs.html'),
        about: resolve(__dirname, 'about.html'),
        exclusion: resolve(__dirname, 'exclusion.html'),
      },
    },
  },
})
