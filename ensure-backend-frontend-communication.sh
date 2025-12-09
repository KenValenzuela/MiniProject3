#!/bin/bash

# Script to ensure backend and frontend can communicate
# This verifies and helps configure the connection

echo "🔍 Checking Backend-Frontend Communication Setup"
echo "=================================================="
echo ""

# Get deployment URLs
echo "📦 Getting latest deployment URLs..."
echo ""

BACKEND_URL=$(cd backend && vercel ls --prod 2>&1 | grep -o 'https://[^ ]*\.vercel\.app' | head -1)
FRONTEND_URL=$(cd frontend && vercel ls --prod 2>&1 | grep -o 'https://[^ ]*\.vercel\.app' | head -1)

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Could not find backend URL"
    BACKEND_URL="https://your-backend-url.vercel.app"
else
    echo "✅ Backend URL: $BACKEND_URL"
fi

if [ -z "$FRONTEND_URL" ]; then
    echo "❌ Could not find frontend URL"
    FRONTEND_URL="https://your-frontend-url.vercel.app"
else
    echo "✅ Frontend URL: $FRONTEND_URL"
fi

echo ""
echo "🔧 Checking Environment Variables..."
echo ""

# Check backend CORS
echo "Backend ALLOWED_ORIGINS:"
cd backend && vercel env ls 2>&1 | grep ALLOWED_ORIGINS || echo "  ⚠️  Not set - needs to be configured"

echo ""
echo "Frontend VITE_API_BASE_URL:"
cd ../frontend && vercel env ls 2>&1 | grep VITE_API_BASE_URL || echo "  ⚠️  Not set - needs to be configured"

echo ""
echo "=================================================="
echo "📋 Configuration Checklist"
echo "=================================================="
echo ""
echo "1. Backend CORS (ALLOWED_ORIGINS):"
echo "   Should include: $FRONTEND_URL"
echo "   Current value: (check above)"
echo ""
echo "2. Frontend API URL (VITE_API_BASE_URL):"
echo "   Should be: $BACKEND_URL"
echo "   Current value: (check above)"
echo ""
echo "3. Test Backend:"
echo "   Visit: $BACKEND_URL/"
echo "   Should return: {\"message\":\"Ride-Hailing Analytics API\",\"version\":\"2.0.0\"}"
echo ""
echo "4. Test Frontend:"
echo "   Visit: $FRONTEND_URL"
echo "   Open browser console (F12) and check for API errors"
echo ""
echo "=================================================="
echo "🔗 Quick Links to Configure"
echo "=================================================="
echo ""
echo "Backend Environment Variables:"
echo "https://vercel.com/ken-valenzuelas-projects/backend/settings/environment-variables"
echo ""
echo "Frontend Environment Variables:"
echo "https://vercel.com/ken-valenzuelas-projects/frontend/settings/environment-variables"
echo ""
echo "=================================================="
echo "⚙️  How to Set Environment Variables"
echo "=================================================="
echo ""
echo "Backend (ALLOWED_ORIGINS):"
echo "  Key: ALLOWED_ORIGINS"
echo "  Value: $FRONTEND_URL,http://localhost:5173"
echo "  Environment: Production (and Preview if you want)"
echo ""
echo "Frontend (VITE_API_BASE_URL):"
echo "  Key: VITE_API_BASE_URL"
echo "  Value: $BACKEND_URL"
echo "  Environment: Production (and Preview if you want)"
echo ""
echo "After setting, Vercel will auto-redeploy!"
echo ""

