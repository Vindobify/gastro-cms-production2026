FROM node:20-alpine AS deps
WORKDIR /app

# Copy Prisma files first (needed for postinstall script if present)
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
COPY package*.json ./

# Install dependencies (ignore scripts to prevent postinstall issues)
RUN npm ci --ignore-scripts || npm install --ignore-scripts

# Run prisma generate manually (DATABASE_URL not needed for generation)
# WICHTIG: Prisma Client muss VOR dem Build generiert werden
# Setze eine Dummy DATABASE_URL für prisma generate (wird nur für Schema-Validierung benötigt)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# Copy all source files
COPY . .

# Build the application
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

