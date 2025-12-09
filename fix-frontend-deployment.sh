#!/bin/bash

# Script to help fix frontend deployment issue
# The main problem: Vercel needs root directory set to "frontend"

echo "🔍 Checking frontend deployment status..."
echo ""

cd frontend
vercel ls --prod 2>&1 | head -5

echo ""
echo "❌ Frontend deployments are failing because Vercel is building from repo root"
echo ""
echo "✅ SOLUTION: Set Root Directory in Vercel Dashboard"
echo ""
echo "📋 Steps to fix:"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Click on 'frontend' project"
echo "3. Click 'Settings' (top menu)"
echo "4. Scroll to 'General' section"
echo "5. Find 'Root Directory'"
echo "6. Click 'Edit' and enter: frontend"
echo "7. Click 'Save'"
echo "8. Go to 'Deployments' tab and click 'Redeploy' on latest deployment"
echo ""
echo "🔗 Direct link: https://vercel.com/ken-valenzuelas-projects/frontend/settings/general"
echo ""
echo "After setting root directory, the build should work!"
echo ""

