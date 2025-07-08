# Backend only Dockerfile
FROM node:18

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend ./backend

# Expose backend port
EXPOSE 10000
WORKDIR /app/backend
CMD ["node", "server.js"]
