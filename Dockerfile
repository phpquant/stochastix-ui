# --- Stage 1: Builder ---
FROM node:24-bookworm AS builder
WORKDIR /app

# Install dependencies based on your lock file
# Change to yarn.lock or pnpm-lock.yaml if you use those package managers
COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Nuxt application
# Ensure your package.json has a "build" script: "nuxt build"
RUN npm run build

# --- Stage 2: Runner ---
FROM node:24-bookworm AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
# Optionally set HOST and PORT if needed, Nuxt defaults usually work
# ENV HOST=0.0.0.0
# ENV PORT=3000

# Copy built assets from the builder stage
COPY --from=builder /app/.output ./.output
# Optionally copy public assets if they are not part of .output
# COPY --from=builder /app/public ./public

# Expose the port Nuxt listens on (default 3000)
EXPOSE 3000

# Command to run the Nuxt production server
# This starts the Node.js server built by Nuxt.
CMD ["node", ".output/server/index.mjs"]
