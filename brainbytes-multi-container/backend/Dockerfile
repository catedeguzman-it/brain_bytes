FROM node:14-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
# This Dockerfile sets up a Node.js environment for the backend service.