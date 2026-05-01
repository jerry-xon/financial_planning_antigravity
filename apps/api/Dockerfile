FROM node:20-bookworm-slim

WORKDIR /app

# Build from repository root so we can use the workspace lockfile.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm ci -w @finplan/api --omit=dev

COPY apps/api/src apps/api/src

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

WORKDIR /app/apps/api
CMD ["node", "src/server.js"]
