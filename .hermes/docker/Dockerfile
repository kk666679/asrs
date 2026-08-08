# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build 2>/dev/null || true

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

# Non-root user (security hardening)
RUN addgroup -S hermes && adduser -S hermes -G hermes

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/index.js ./
COPY --from=builder /app/utils.js ./
COPY --from=builder /app/config.json ./

USER hermes

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node index.js status || exit 1

CMD ["node", "dist/index.js"]
