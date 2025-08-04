# 🐳 WebCore Server Dockerfile
# Multi-stage build for optimized production image

# 🏗️ Build Stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# 🚀 Production Stage
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S webcore -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=webcore:nodejs /app/dist ./dist
COPY --from=builder --chown=webcore:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=webcore:nodejs /app/prisma ./prisma

# Create necessary directories
RUN mkdir -p storage/uploads storage/plugins logs && \
    chown -R webcore:nodejs storage logs

# Switch to non-root user
USER webcore

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["dumb-init", "node", "dist/server.js"]

# 🧪 Development Stage
FROM node:18-alpine AS development

# Install development dependencies
RUN apk add --no-cache python3 make g++

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S webcore -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY --chown=webcore:nodejs . .

# Create necessary directories
RUN mkdir -p storage/uploads storage/plugins logs && \
    chown -R webcore:nodejs storage logs

# Switch to non-root user
USER webcore

# Expose ports (app + debug)
EXPOSE 3000 9229

# Start in development mode
CMD ["npm", "run", "dev"]
