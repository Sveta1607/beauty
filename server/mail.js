// Отправка письма с данными заявки на ящик менеджера через SMTP (nodemailer)
import nodemailer from 'nodemailer'
import { getSmtpConfig, isSmtpConfigured, LEADS_INBOX_EMAIL } from './config.js'

/**
 * Отправляет одно письмо с полями заявки. Требуются SMTP_USER и SMTP_PASS в окружении.
 * @param {{ firstName: string, lastName: string, phone: string, email: string, tariff?: string }} data
 * @throws при ошибке транспорта SMTP
 */
export async function sendApplicationEmail(data) {
  if (!isSmtpConfigured()) {
    return false
  }
  const cfg = getSmtpConfig()
  // Таймауты и TLS — стабильнее с Яндексом и облачными сетями
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    requireTLS: cfg.requireTLS === true,
    auth: cfg.auth,
    connectionTimeout: 25_000,
    greetingTimeout: 20_000,
    tls: { minVersion: 'TLSv1.2' },
    logger: process.env.SMTP_DEBUG === '1',
    debug: process.env.SMTP_DEBUG === '1',
  })

  const tariffLi = data.tariff ? `<li>Тариф: ${escapeHtml(data.tariff)}</li>` : ''

  const text = [
    'Новая заявка с сайта Beauty University',
    `Имя: ${data.firstName}`,
    `Фамилия: ${data.lastName}`,
    `Телефон: ${data.phone}`,
    `Email: ${data.email}`,
    data.tariff ? `Тариф: ${data.tariff}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const html = `<p>Новая заявка с сайта <strong>Beauty University</strong></p>
<ul>
<li>Имя: ${escapeHtml(data.firstName)}</li>
<li>Фамилия: ${escapeHtml(data.lastName)}</li>
<li>Телефон: ${escapeHtml(data.phone)}</li>
<li>Email: ${escapeHtml(data.email)}</li>
${tariffLi}
</ul>`

  await transporter.sendMail({
    from: cfg.auth.user,
    to: LEADS_INBOX_EMAIL,
    subject: `Заявка: ${data.firstName} ${data.lastName}`,
    text,
    html,
  })
  return true
}

/** Минимальное экранирование для HTML-тела письма */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
