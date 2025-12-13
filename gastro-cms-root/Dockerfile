### Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps (npm ci expects package-lock)
COPY package.json package-lock.json ./

# Copy Prisma files before npm ci (needed for postinstall script)
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

RUN npm ci --only=production=false

# Copy source and build
COPY . .
RUN npm run build

### Stage 2: Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only what is needed for runtime
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/src/messages ./src/messages

EXPOSE 3000

CMD ["npm", "run", "start"]

