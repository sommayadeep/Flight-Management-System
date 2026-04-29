FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment
ENV NEXT_TELEMETRY_DISABLED=1

# Run the application
CMD ["npm", "run", "dev"]
