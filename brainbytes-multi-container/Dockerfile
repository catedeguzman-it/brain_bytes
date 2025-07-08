# Stage 1: Build frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build && npm run export

# Stage 2: Setup backend and serve static files
FROM node:18
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend and static frontend build
COPY backend ./backend
COPY --from=frontend-builder /app/frontend/out ./frontend/out

WORKDIR /app/backend
CMD ["node", "server.js"]
