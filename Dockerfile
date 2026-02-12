FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Install dependencies and build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /usr/src/app

# Install only production dependencies
COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci --omit=dev

# Copy build artifacts
COPY --from=builder /usr/src/app/dist ./dist

# Copy crypto shim
COPY crypto-shim.js ./

EXPOSE 3003

CMD ["node", "--require", "./crypto-shim.js", "dist/main.js"]
