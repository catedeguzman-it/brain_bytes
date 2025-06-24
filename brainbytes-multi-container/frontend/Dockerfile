FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ENV HOST=http://localhost:4000
EXPOSE 3000
CMD ["npm", "run", "dev"]
