# --- Stage 1: Build ---
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and config
COPY tsconfig.json ./
COPY src ./src

# Build the TypeScript project
RUN npm run build

# --- Stage 2: Runtime ---
FROM node:20-slim

WORKDIR /app

# Copy only the compiled code and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies (saves space)
RUN npm install --omit=dev

# Ensure the save file can be written to the container
RUN touch save.json && chmod 666 save.json

# Start the game
CMD ["node", "dist/index.js"]