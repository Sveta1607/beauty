// Статические сведения о сайте в JSON — единое место для мобильного приложения или будущего фронта на API
export const siteInfo = {
  brand: 'Beauty University',
  tagline:
    'Онлайн-пространство про макияж, причёски, стиль и уход — закрытый канал и комьюнити.',
  locale: 'ru',
  pages: [
    { slug: 'index', path: '/index.html', title: 'Beauty University', navLabel: 'Beauty University' },
    { slug: 'format', path: '/format.html', title: 'О формате', navLabel: 'О формате' },
    { slug: 'awaiting', path: '/awaiting.html', title: 'Что тебя ждёт', navLabel: 'Что тебя ждёт' },
    { slug: 'exclusion', path: '/exclusion.html', title: 'Исключение с канала', navLabel: 'Исключение с канала' },
  ],
  legalPlaceholders: ['Публичная оферта', 'Политика обработки персональных данных'],
}
