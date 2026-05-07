#!/usr/bin/env bash
set -e

# Set these environment variables before running:
# export CLOUDFLARE_API_TOKEN="your_token_here"
# export CLOUDFLARE_ACCOUNT_ID="bc3ea57fa2c91079744abb2382fcad00"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-bc3ea57fa2c91079744abb2382fcad00}"
export VITE_API_URL="${VITE_API_URL:-https://legsend-api.hexaponnaya.workers.dev}"

cd /home/user/webapp/apps/web

echo "==> Installing dependencies..."
npm install

echo "==> Building frontend..."
VITE_API_URL="$VITE_API_URL" npm run build

echo "==> Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist \
  --project-name legsend \
  --branch main \
  --commit-dirty=true

echo ""
echo "✅ LEGSEND Frontend deployed!"
echo "🌐 URL: https://legsend.pages.dev"
