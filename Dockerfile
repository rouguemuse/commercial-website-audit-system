# Multi-stage Dockerfile for Commercial Website Audit System
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Clean install all dependencies
RUN npm ci

# Copy source code and build config
COPY . .

# Build Vite frontend assets to dist/
RUN npm run build

# Remove development dependencies for a lean production image
RUN npm prune --production

# -------------------------------------------------------------
# Production Runner Image
# -------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules and compiled output from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.mjs ./server.mjs
COPY --from=builder /app/api ./api
COPY --from=builder /app/src/types ./src/types

EXPOSE 3000

# Run Express production server
CMD ["node", "server.mjs"]
