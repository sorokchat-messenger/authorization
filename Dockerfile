# ---- База ----
FROM node:24.20.0-alpine AS base
WORKDIR /application
# libc6-compat може знадобитися для деяких бінарників, але OpenSSL критичний для Prisma
RUN apk add --no-cache libc6-compat openssl

# ---- Встановлення залежностей ----
FROM base AS dependencies
RUN npm install -g bun
COPY package.json bun.lock* ./
# Кешуємо і залежності, і Prisma-схему для генерації
COPY prisma ./prisma/
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# ---- Збірка ----
FROM base AS builder
RUN npm install -g bun
COPY --from=dependencies /application/node_modules ./node_modules
COPY --from=dependencies /application/package.json ./package.json
COPY --from=dependencies /application/bun.lock* ./
COPY --from=dependencies /application/prisma ./prisma/
COPY . .
RUN bunx prisma generate
RUN bun run build

FROM base AS production-dependencies
RUN npm install -g bun
COPY package.json bun.lock* ./
COPY prisma ./prisma/
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production
RUN bunx prisma generate

FROM node:24.20.0-alpine AS runner
WORKDIR /application
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
COPY --from=production-dependencies --chown=nestjs:nodejs /application/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /application/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /application/package.json ./
COPY --from=builder --chown=nestjs:nodejs /application/src/generated ./src/generated
COPY --from=builder --chown=nestjs:nodejs /application/prisma ./prisma
COPY --chown=nestjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
USER nestjs
EXPOSE 50051
CMD ["./docker-entrypoint.sh"]