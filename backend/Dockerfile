# === Étape 1 : Builder ===
FROM node:22-alpine AS builder

# Installer les dépendances système nécessaires pour Prisma/OpenSSL
RUN apk add --no-cache libc6-compat openssl bash curl

# Crée le répertoire de l'application
WORKDIR /usr/src/app

# Copie package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances
RUN npm ci

# Copie tout le code source
COPY . .

# Génère Prisma Client
RUN npx prisma generate

# Build NestJS
RUN npm run build


# === Étape 2 : Image finale ===
FROM node:22-alpine

# Installer OpenSSL pour Prisma
RUN apk add --no-cache libc6-compat openssl bash curl

# Crée le répertoire de l'application
WORKDIR /usr/src/app

# Copie les fichiers essentiels depuis le builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Expose le port
EXPOSE 3000

# Commande de démarrage : build + seed + start
CMD ["sh", "-c", "\
  echo '🌱 Running Prisma generate...' && npx prisma generate && \
  echo '🌱 Seeding database...' && node prisma/seed.ts && \
  echo '🚀 Starting app...' && node dist/src/main.js \
"]
