// Схемы Zod для валидации тела POST-запросов — отсечь мусор и XSS-длину до записи в файл
import { z } from 'zod'

/** Поля формы «связаться / заявка» с информационного сайта */
export const contactBodySchema = z.object({
  email: z.string().email('Укажите корректный email'),
  name: z
    .string()
    .max(120, 'Имя слишком длинное')
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  message: z
    .string()
    .min(10, 'Сообщение не короче 10 символов')
    .max(2000, 'Сообщение не длиннее 2000 символов'),
  /** С какой страницы отправили (для аналитики), необязательно */
  page: z.string().max(80).optional().transform((v) => (v === '' ? undefined : v)),
})
