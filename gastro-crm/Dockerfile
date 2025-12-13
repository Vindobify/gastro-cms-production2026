FROM node:20-alpine AS deps
WORKDIR /app
# Copy Prisma files first (needed for postinstall script if present)
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
COPY package*.json ./
# Install dependencies
RUN npm ci || npm install
COPY . .
RUN npm run build

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

