// Отправка письма с данными заявки на ящик менеджера через SMTP (nodemailer)
import nodemailer from 'nodemailer'
import { getSmtpConfig, isSmtpConfigured, LEADS_INBOX_EMAIL } from './config.js'

/**
 * Отправляет одно письмо с полями заявки. Требуются SMTP_USER и SMTP_PASS в окружении.
 * @param {{ firstName: string, lastName: string, phone: string, email: string }} data
 * @throws при ошибке транспорта SMTP
 */
export async function sendApplicationEmail(data) {
  if (!isSmtpConfigured()) {
    return false
  }
  const cfg = getSmtpConfig()
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.auth,
  })

  const text = [
    'Новая заявка с сайта Beauty University',
    `Имя: ${data.firstName}`,
    `Фамилия: ${data.lastName}`,
    `Телефон: ${data.phone}`,
    `Email: ${data.email}`,
  ].join('\n')

  const html = `<p>Новая заявка с сайта <strong>Beauty University</strong></p>
<ul>
<li>Имя: ${escapeHtml(data.firstName)}</li>
<li>Фамилия: ${escapeHtml(data.lastName)}</li>
<li>Телефон: ${escapeHtml(data.phone)}</li>
<li>Email: ${escapeHtml(data.email)}</li>
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
