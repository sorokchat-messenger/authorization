FROM node:24.20.0-alpine AS base
WORKDIR /application
RUN apk add --no-cache libc6-compat

FROM base AS dependencies
RUN npm install -g bun
COPY package.json bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM base AS builder
RUN npm install -g bun
COPY --from=dependencies /application/node_modules ./node_modules
COPY --from=dependencies /application/package.json ./package.json
COPY --from=dependencies /application/bun.lock* ./
COPY . .
ENV NODE_ENV=production
RUN bun run build

FROM base AS production-dependencies
RUN npm install -g bun
COPY package.json bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production

FROM node:24.20.0-alpine AS runner
WORKDIR /application
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
COPY --from=production-dependencies --chown=nestjs:nodejs /application/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /application/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /application/package.json ./
USER nestjs
EXPOSE 50051
CMD ["node", "dist/main.js"]