# Frontend: Next.js 16. Two-stage build → tiny runtime image (Next "standalone" output).

# ---- Stage 1: build the site ----
FROM node:22-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Next bakes the /api proxy target into the build (not at runtime), so the backend
# URL must be present HERE, during `npm run build`. Override with --build-arg if it changes.
ARG NEXT_PUBLIC_API_URL=https://tickets-backend-545235255861.us-central1.run.app
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# ---- Stage 2: run only what's needed ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Cloud Run overrides PORT at runtime; 8080 is its default.
ENV PORT=8080

# standalone = a minimal Node server + only the traced dependencies it actually uses.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 8080
CMD ["node", "server.js"]
