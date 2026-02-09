#!/bin/sh
set -e

echo "📦 Starting app..."

echo "Running migrations..."
npx prisma migrate deploy

echo "Launching NestJS..."
exec npm run start:prod