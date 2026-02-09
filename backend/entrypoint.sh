#!/bin/sh
set -e

# Vérifie DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL n'est pas défini"
  exit 1
fi

# Génère Prisma Client si pas déjà fait
if [ ! -d "node_modules/@prisma/client" ]; then
  echo "⏳ Generating Prisma client..."
  npx prisma generate
fi

# Démarre l’app
echo "🚀 Starting NestJS app..."
node dist/main.js
