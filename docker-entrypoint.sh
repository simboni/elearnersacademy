#!/bin/sh
set -e

echo "→ Applying database schema…"
npx prisma db push --skip-generate

# Seed once on first boot (only if the DB has no users yet), or when SEED_ON_START=true.
NEED_SEED="${SEED_ON_START:-auto}"
if [ "$NEED_SEED" = "true" ]; then
  echo "→ Seeding database (forced)…"
  npx tsx prisma/seed.ts || echo "⚠ seed skipped/failed"
elif [ "$NEED_SEED" = "auto" ]; then
  USERS=$(node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.user.count().then(n=>{console.log(n);process.exit(0)}).catch(()=>{console.log(0);process.exit(0)})" 2>/dev/null || echo 0)
  if [ "$USERS" = "0" ]; then
    echo "→ Empty database — seeding starter content…"
    npx tsx prisma/seed.ts || echo "⚠ seed skipped/failed"
  fi
fi

echo "→ Starting eLearners Academy on :${PORT:-3000}"
exec node_modules/.bin/next start -p "${PORT:-3000}"
