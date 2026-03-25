// Конфигурация сервера из переменных окружения: порт, CORS, пути к проекту и сборке фронта
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/** Корень репозитория (родитель папки server) — для путей к dist и data */
export const ROOT = path.join(__dirname, '..')

/** Порт HTTP-сервера; по умолчанию 8787, чтобы не пересекаться с Vite */
export const PORT = Number(process.env.PORT) || 8787

/** Каталог `vite build` — отсюда раздаём статику в продакшене */
export const DIST_DIR = path.join(ROOT, 'dist')

/**
 * Список origin для CORS: из CORS_ORIGINS через запятую или дефолт под dev-прокси Vite.
 * Нужен, чтобы браузер мог дергать API с другого порта при разработке.
 */
export function getAllowedOrigins() {
  const raw = process.env.CORS_ORIGINS?.trim()
  if (!raw) {
    return ['http://127.0.0.1:24680', 'http://localhost:24680']
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

/** Включить раздачу папки dist (прод или явный флаг SERVE_STATIC=1) */
export function shouldServeStatic() {
  return process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === '1'
}

/**
 * Ящик для писем с заявок (временный дефолт; переопределяется LEADS_INBOX_EMAIL в .env / Amvera).
 */
export const LEADS_INBOX_EMAIL =
  process.env.LEADS_INBOX_EMAIL?.trim() || 'Sharunkina2014@yandex.ru'

/**
 * Параметры SMTP (Яндекс: smtp.yandex.ru, порт 465, пароль приложения в SMTP_PASS).
 * Если SMTP_USER/SMTP_PASS пусты — письмо не шлём, заявка только в файл.
 */
export function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim() || 'smtp.yandex.ru'
  const port = Number(process.env.SMTP_PORT) || 465
  const user = process.env.SMTP_USER?.trim() || ''
  const pass = process.env.SMTP_PASS?.trim() || ''
  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  }
}

export function isSmtpConfigured() {
  const { auth } = getSmtpConfig()
  return Boolean(auth.user && auth.pass)
}
