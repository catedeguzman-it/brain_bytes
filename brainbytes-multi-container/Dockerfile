# Stage 1: Build frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup backend and serve frontend
FROM node:18

# Create app directory
WORKDIR /app

# Copy backend dependencies and install
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy the rest of the backend and the built frontend
COPY backend ./backend
COPY --from=frontend-builder /app/frontend/out ./frontend/out

# Expose backend port (assumed from server.js)
EXPOSE 10000

# Define working directory for CMD
WORKDIR /app/backend

# Start backend server
CMD ["node", "server.js"]
