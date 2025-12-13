FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false
COPY prisma ./prisma
# Prisma generate benötigt DATABASE_URL, aber nur für Schema-Validierung
# In Production wird DATABASE_URL zur Laufzeit gesetzt
RUN npx prisma generate || true
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
EXPOSE 3000
CMD ["npm", "run", "start"]

