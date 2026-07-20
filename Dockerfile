# movie-recommender — single-host web-app image (FE at /, API at /api) — Node backend
# Stage 1: build the frontend
FROM node:22-alpine AS fe
WORKDIR /app/frontend
COPY frontend/package*.json ./
# Scaffold repos have no package-lock.json yet — npm ci hard-fails without one.
RUN npm ci || npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Node backend + built static assets, served from ONE process on ONE port
FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json ./
# Install all deps (including devDeps) so tsc is available for the build step
RUN npm ci || npm install
COPY backend/ .
# Compile TypeScript → dist/
RUN npm run build
# Prune devDependencies from the final layer
RUN npm prune --omit=dev
# Backend must serve ./public statically with an SPA fallback; API routes live under /api
COPY --from=fe /app/frontend/dist ./public
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/server.js"]
