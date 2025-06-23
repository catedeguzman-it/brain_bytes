FROM node:18

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install --save-dev nodemon

COPY . .

EXPOSE 4000
CMD ["npm", "run", "dev"]
