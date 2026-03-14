# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Build the app
RUN npm run build

# Expose port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
