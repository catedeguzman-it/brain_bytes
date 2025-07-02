FROM node:20.17.0

WORKDIR /usr/src/app

# Copy package files and install dependencies in one RUN instruction
COPY package*.json ./

# Pin dev dependency and production dependency versions in one layer
RUN npm install

# Copy the rest of the source files
COPY . .

EXPOSE 4000


# Start backend in production mode
CMD ["node", "server.js"]
