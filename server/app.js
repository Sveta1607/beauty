// Приложение Express: CORS, JSON, маршруты API, опционально статика из dist после сборки Vite
import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import { DIST_DIR, getAllowedOrigins, shouldServeStatic } from './config.js'
import { siteInfo } from './siteInfo.js'
import { applicationBodySchema, contactBodySchema } from './schemas.js'
import { appendApplication, appendContact } from './storage.js'
import { sendApplicationEmail } from './mail.js'
import { isSmtpConfigured } from './config.js'

/**
 * Создаёт настроенное Express-приложение (удобно для тестов без listen).
 * @returns {import('express').Express}
 */
export function createApp() {
  const app = express()

  // Ограничение размера JSON — защита от слишком тяжёлых тел запросов
  app.use(express.json({ limit: '32kb' }))

  // Разрешаем запросы с dev-сервера Vite и с доменов из CORS_ORIGINS
  app.use(
    cors({
      origin: getAllowedOrigins(),
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    }),
  )

  // Проверка живости для балансировщиков и мониторинга
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'beauty-university-api' })
  })

  // Отдаём структурированное описание сайта для виджетов или будущего SPA
  app.get('/api/site', (_req, res) => {
    res.json(siteInfo)
  })

  // Приём сообщений с формы обратной связи / заявки (информационный сайт)
  app.post('/api/contact', async (req, res, next) => {
    try {
      const parsed = contactBodySchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.issues.map((i) => i.message).join('; ')
        return res.status(400).json({ error: msg })
      }
      await appendContact(parsed.data)
      return res.status(201).json({ ok: true })
    } catch (err) {
      return next(err)
    }
  })

  // Заявка с главной: имя, фамилия, телефон, email → файл + письмо (если настроен SMTP)
  app.post('/api/application', async (req, res, next) => {
    try {
      const parsed = applicationBodySchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.issues.map((i) => i.message).join('; ')
        return res.status(400).json({ error: msg })
      }
      await appendApplication(parsed.data)
      let emailed = false
      if (isSmtpConfigured()) {
        try {
          emailed = await sendApplicationEmail(parsed.data)
        } catch (mailErr) {
          console.error('[mail]', mailErr.message)
          return res.status(502).json({
            error: 'Заявка сохранена, но письмо не отправилось. Попробуйте позже или напишите нам напрямую.',
          })
        }
      }
      return res.status(201).json({ ok: true, emailed })
    } catch (err) {
      return next(err)
    }
  })

  // В продакшене (или при SERVE_STATIC=1) отдаём собранный фронт из dist одним процессом
  if (shouldServeStatic() && fs.existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR))
  }

  // Единый обработчик ошибок: не утекаем stack наружу в проде
  app.use((err, _req, res, _next) => {
    const status = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500
    const body =
      process.env.NODE_ENV === 'production'
        ? { error: 'Внутренняя ошибка сервера' }
        : { error: err.message || 'Внутренняя ошибка сервера', stack: err.stack }
    res.status(status).json(body)
  })

  return app
}
