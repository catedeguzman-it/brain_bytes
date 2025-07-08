FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

ENV NEXT_PUBLIC_API_URL=https://brainbytes-backend-oj3s.onrender.com

EXPOSE 3000

# Start the app
CMD ["npm", "start"]
