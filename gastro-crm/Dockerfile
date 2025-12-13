FROM node:20-alpine AS deps
WORKDIR /app
# Copy Prisma files first (needed for postinstall script if present)
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
COPY package*.json ./
# Install dependencies (ignore scripts to prevent postinstall issues)
RUN npm ci --ignore-scripts || npm install --ignore-scripts
# Run prisma generate manually (DATABASE_URL not needed for generation)
RUN npx prisma generate || true
COPY . .
# Build with verbose output for debugging
RUN npm run build 2>&1 || (echo "Build failed, checking logs..." && cat .next/trace 2>/dev/null || true && exit 1)

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/public ./public
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/prisma.config.ts ./prisma.config.ts
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 3000
CMD ["npm", "run", "start"]

