#!/bin/sh

# Vérifie que DATABASE_URL est défini
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL n'est pas défini"
  exit 1
fi

# Extraire host et port depuis DATABASE_URL (postgres://user:pass@host:port/db)
DATABASE_HOST=$(echo "$DATABASE_URL" | sed -E 's#postgresql?://[^:]+:[^@]+@([^:/]+):([0-9]+)/(.*)#\1#')
DATABASE_PORT=$(echo "$DATABASE_URL" | sed -E 's#postgresql?://[^:]+:[^@]+@([^:/]+):([0-9]+)/(.*)#\2#')

# Défaut si extraction échoue
DATABASE_HOST=${DATABASE_HOST:-localhost}
DATABASE_PORT=${DATABASE_PORT:-5432}

echo "⏳ Waiting for database at $DATABASE_HOST:$DATABASE_PORT..."

# Attente que la DB soit prête
while ! nc -z "$DATABASE_HOST" "$DATABASE_PORT"; do
  sleep 1
done

echo "✅ Database is ready"

# Générer Prisma Client au démarrage
npx prisma generate

# Lancer l'application
echo "🚀 Starting NestJS app..."
node dist/main.js
