FROM node:20.17.0

WORKDIR /usr/src/app

# Copy package files and install dependencies in one RUN instruction
COPY package*.json ./

# Pin dev dependency and production dependency versions in one layer
RUN npm install express@4.18.2 && \
    npm install --save-dev nodemon@3.1.0

# Copy the rest of the source files
COPY . .

EXPOSE 4000


# Start backend in production mode
CMD ["node", "server.js"]
