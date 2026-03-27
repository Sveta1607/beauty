// Подхватываем .env до импорта config (SMTP_* и прочие переменные для локального запуска)
import 'dotenv/config'
// Точка входа бэкенда: поднимаем HTTP-сервер на заданном порту
import { createServer } from 'node:http'
import { createApp } from './app.js'
import { PORT } from './config.js'

const app = createApp()
const server = createServer(app)

// Слушаем 0.0.0.0 — в Docker/Amvera шлюз стучится не в loopback; только 127.0.0.1 даёт 502 «приложение не ответило»
const HOST = process.env.HOST?.trim() || '0.0.0.0'

server.listen(PORT, HOST, () => {
  // Лог в консоль — видно, что API готов принимать запросы (в т.ч. через прокси Vite)
  console.log(`[beauty-api] http://${HOST}:${PORT}`)
})

server.on('error', (err) => {
  console.error('[beauty-api] не удалось запустить сервер:', err.message)
  process.exit(1)
})
