#!/bin/sh
set -e

echo "📦 Starting app..."

# Générer Prisma Client
npx prisma generate

# Lancer NestJS en mode production
exec node dist/main.js
