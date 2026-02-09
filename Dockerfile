# syntax=docker/dockerfile:1.7

# --------------------------------------------------
# Dependency stage (cache npm registry + install deps)
# --------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

# Cache npm registry for offline reuse
RUN --mount=type=cache,target=/root/.npm \
    npm ci


# --------------------------------------------------
# Build stage
# --------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy installed deps (REAL files now exist)
COPY --from=deps /app/node_modules ./node_modules

COPY package*.json ./

# Copy source & config
COPY tsconfig*.json ./
COPY src ./src

RUN npm run build


# --------------------------------------------------
# Runtime stage
# --------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -g 1001 nestjs \
 && adduser -D -u 1001 -G nestjs nestjs

COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --chown=nestjs:nestjs package*.json ./

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
