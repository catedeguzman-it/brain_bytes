FROM node:18-alpine

WORKDIR /app

# Install curl
RUN apk add --no-cache curl

COPY package*.json ./
RUN npm install
COPY . .

ENV HOST=http://localhost:4000
EXPOSE 3000
CMD ["npm", "run", "start"]
