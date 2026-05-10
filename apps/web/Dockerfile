FROM node:20.10-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/ui/package.json packages/ui/
COPY packages/sdk/package.json packages/sdk/
COPY packages/types/package.json packages/types/
COPY packages/i18n/package.json packages/i18n/
COPY packages/config/package.json packages/config/
RUN pnpm install --frozen-lockfile

FROM node:20.10-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate
COPY --from=deps /app /app
COPY . .
ENV NODE_OPTIONS=--max-old-space-size=6144
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @karpos/web build

FROM node:20.10-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache tini && addgroup -S karpos && adduser -S karpos -G karpos
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
USER karpos
EXPOSE 3000
ENTRYPOINT ["/sbin/tini","--"]
CMD ["node","apps/web/server.js"]
