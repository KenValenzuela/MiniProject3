#!/bin/bash

# Deployment script for Ride-Hailing Dashboard
# This script will deploy both backend and frontend to Vercel

set -e

echo "🚀 Starting deployment process..."
echo ""

# Check if logged into Vercel
if ! vercel whoami &>/dev/null; then
    echo "❌ Not logged into Vercel. Please run: vercel login"
    echo "   This will open a browser for authentication."
    exit 1
fi

echo "✅ Logged into Vercel"
echo ""

# Deploy backend
echo "📦 Deploying backend..."
cd backend
BACKEND_URL=$(vercel --prod --yes 2>&1 | grep -o 'https://[^ ]*\.vercel\.app' | head -1 || echo "")
if [ -z "$BACKEND_URL" ]; then
    echo "⚠️  Could not extract backend URL. Check deployment output above."
    echo "   Please note the URL and set it as VITE_API_BASE_URL for frontend."
    read -p "Enter backend URL (or press Enter to skip): " BACKEND_URL
else
    echo "✅ Backend deployed to: $BACKEND_URL"
fi
cd ..

# Deploy frontend
echo ""
echo "📦 Deploying frontend..."
cd frontend
if [ ! -z "$BACKEND_URL" ]; then
    echo "Setting VITE_API_BASE_URL to $BACKEND_URL"
    vercel env add VITE_API_BASE_URL production <<< "$BACKEND_URL" || echo "⚠️  Could not set env var automatically"
fi
FRONTEND_URL=$(vercel --prod --yes 2>&1 | grep -o 'https://[^ ]*\.vercel\.app' | head -1 || echo "")
if [ -z "$FRONTEND_URL" ]; then
    echo "⚠️  Could not extract frontend URL. Check deployment output above."
else
    echo "✅ Frontend deployed to: $FRONTEND_URL"
fi
cd ..

echo ""
echo "🎉 Deployment complete!"
echo ""
if [ ! -z "$BACKEND_URL" ] && [ ! -z "$FRONTEND_URL" ]; then
    echo "📝 Next steps:"
    echo "   1. Go to Vercel dashboard: https://vercel.com/dashboard"
    echo "   2. Update backend ALLOWED_ORIGINS to include: $FRONTEND_URL"
    echo "   3. Verify frontend VITE_API_BASE_URL is set to: $BACKEND_URL"
    echo ""
    echo "🌐 Your app:"
    echo "   Frontend: $FRONTEND_URL"
    echo "   Backend:  $BACKEND_URL"
fi

