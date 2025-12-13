FROM node:20-alpine AS deps
WORKDIR /app
# Copy Prisma files first (needed for postinstall script)
COPY prisma ./prisma
COPY package*.json ./
# Install dependencies (postinstall will run prisma generate)
# Use --ignore-scripts to prevent postinstall from running, we'll run it manually
RUN npm ci --ignore-scripts || npm install --ignore-scripts
# Now run prisma generate manually (DATABASE_URL not needed for generation)
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

