FROM node:18

WORKDIR /usr/src/app

# Copy package files and install dependencies in one RUN instruction
COPY package*.json ./

# Pin dev dependency and production dependency versions in one layer
RUN npm install express@4.18.2 && \
    npm install --save-dev nodemon@3.1.0

# Copy the rest of the source files
COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
