# syntax=docker/dockerfile:1

FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Dummy value only so `prisma generate` / `next build` can validate the schema;
# no real DB connection happens at build time. The real DATABASE_URL is
# provided at `docker run` time and is NOT baked into this image.
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"

# R2_PUBLIC_URL is not a secret (it's a public bucket URL) — it needs to be
# available at build time because `next.config.ts` reads it to whitelist the
# R2 domain for `next/image`, and that config gets baked into the build.
ARG R2_PUBLIC_URL
ENV R2_PUBLIC_URL=${R2_PUBLIC_URL}

RUN bunx prisma generate
RUN bun run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
