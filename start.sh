#!/bin/sh
set -e

echo "Running database schema sync..."
npx prisma db push --skip-generate 2>&1 || echo "Schema sync completed or skipped"

echo "Running database bootstrap..."
node prisma/bootstrap.cjs 2>&1 || echo "Bootstrap completed or skipped"

echo "Starting application..."
exec npm start
