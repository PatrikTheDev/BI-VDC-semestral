FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build the app
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production
FROM base AS runtime
COPY --from=build /app/.output ./.output
COPY --from=build /app/node_modules ./node_modules
COPY package.json drizzle.config.ts ./
COPY src/db ./src/db

EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["bun", "run", ".output/server/index.mjs"]
