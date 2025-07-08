# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Optional: install curl for debugging
RUN apk add --no-cache curl

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Build Next.js app
RUN npm run build

# Use appropriate port for Next.js
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]
