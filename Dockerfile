# ── eLearners Academy · production image ────────────────────────────────
# Self-contained: Next.js + Prisma + SQLite (on a mounted volume).
# For Postgres, see DEPLOYMENT.md.

FROM node:22-slim AS base
WORKDIR /app
# OpenSSL is required by the Prisma query engine.
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# --- deps (includes dev deps so the build + runtime prisma CLI work) ---
FROM base AS deps
COPY package*.json ./
RUN npm ci

# --- build ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# --- runtime ---
FROM base AS run
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:/data/prod.db"
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.mjs ./next.config.mjs
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh && mkdir -p /data
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["./docker-entrypoint.sh"]
