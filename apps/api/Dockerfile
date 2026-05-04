FROM node:20.10-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++ \
  && corepack enable && corepack prepare pnpm@9.10.0 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/
COPY packages/sdk/package.json packages/sdk/
RUN pnpm install --frozen-lockfile

FROM node:20.10-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate
COPY --from=deps /app /app
COPY . .
RUN pnpm --filter @karpos/api build

FROM node:20.10-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache tini && addgroup -S karpos && adduser -S karpos -G karpos
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/node_modules ./node_modules
USER karpos
EXPOSE 4000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
