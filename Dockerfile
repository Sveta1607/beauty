# Сборка фронта (Vite) и минимальный runtime-образ только с production-зависимостями и папкой server

# Этап 1: ставим все зависимости и собираем статику в dist
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Этап 2: только runtime — без Vite, меньше размер образа
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
# Amvera по умолчанию проксирует HTTP на containerPort 80 — совпадает с listen приложения
ENV PORT=80
# Том постоянного хранилища Amvera монтируется в /data (см. amvera.yaml)
ENV PERSISTENT_DATA_DIR=/data
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY --from=builder /app/dist ./dist
EXPOSE 80
CMD ["node", "server/index.js"]
