// Схемы Zod для валидации тела POST-запросов — отсечь мусор и XSS-длину до записи в файл
import { z } from 'zod'

/** Заявка с главной: имя, фамилия, телефон, email — все обязательны */
export const applicationBodySchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'Укажите имя')
    .max(80, 'Имя слишком длинное'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Укажите фамилию')
    .max(80, 'Фамилия слишком длинная'),
  phone: z
    .string()
    .trim()
    .min(10, 'Укажите номер телефона')
    .max(22, 'Номер слишком длинный')
    .regex(/^[\d+\s\-()]+$/, 'Допустимы только цифры, +, пробелы, скобки и дефис'),
  email: z.string().trim().email('Укажите корректный email'),
})

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
