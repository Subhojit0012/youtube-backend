FROM node:22-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies including dev dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source and TypeScript config
COPY tsconfig.json ./
COPY src ./src

# Expose port
EXPOSE 2026

# Start the application with tsx for development (TypeScript runtime)
CMD ["pnpm", "exec", "tsx", "./src/index.ts"]
