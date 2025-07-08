# Use lightweight Node image
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the static site
RUN npm run build

# Install static file server
RUN npm install -g serve

# Expose the port serve will use
EXPOSE 3000

# Run static site server
CMD ["serve", "-s", "out", "-l", "3000"]
