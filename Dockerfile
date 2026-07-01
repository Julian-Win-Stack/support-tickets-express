# Backend: Express 5 + SQLite. Runs TypeScript directly via tsx (no build step).
FROM node:22-slim

WORKDIR /app

# Install deps in their own layer so editing source doesn't trigger a full reinstall.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
# Cloud Run injects its own PORT at runtime; 8080 is the value it uses by default.
ENV PORT=8080
EXPOSE 8080

# npm start === tsx server.ts
CMD ["npm", "start"]
