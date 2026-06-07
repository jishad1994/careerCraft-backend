# -------- Stage 1: Build --------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install all dependencies (including dev deps for TypeScript build)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript → dist/
RUN rm -rf dist && npm run build


# -------- Stage 2: Production --------
FROM node:20-alpine AS production

WORKDIR /app

# Copy only package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built output from builder stage
COPY --from=builder /app/dist ./dist

# Expose app port
EXPOSE 4000

# Start app from compiled JS
CMD ["node", "dist/server.js"]

