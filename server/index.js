// Подхватываем .env до импорта config (SMTP_* и прочие переменные для локального запуска)
import 'dotenv/config'
// Точка входа бэкенда: поднимаем HTTP-сервер на заданном порту
import { createServer } from 'node:http'
import { createApp } from './app.js'
import { PORT } from './config.js'

const app = createApp()
const server = createServer(app)

server.listen(PORT, () => {
  // Лог в консоль — видно, что API готов принимать запросы (в т.ч. через прокси Vite)
  console.log(`[beauty-api] http://127.0.0.1:${PORT}`)
})

server.on('error', (err) => {
  console.error('[beauty-api] не удалось запустить сервер:', err.message)
  process.exit(1)
})
