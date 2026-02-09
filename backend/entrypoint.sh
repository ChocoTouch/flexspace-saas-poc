#!/bin/sh
set -e

echo "DATABASE_URL=$DATABASE_URL"
echo "NODE_ENV=$NODE_ENV"
echo "JWT_SECRET=$JWT_SECRET"
node -v
npm -v
ls -l dist

# Démarre l’app
echo "🚀 Starting NestJS app..."
node dist/main.js
