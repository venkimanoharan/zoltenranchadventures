FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy backend code
COPY backend/ ./

# Copy public files
COPY public/ /app/public/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "server.js"]
