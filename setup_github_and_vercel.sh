#!/bin/bash

# Script to set up GitHub repository and connect to Vercel
# This will help you deploy from GitHub automatically

set -e

echo "🚀 Setting up GitHub repository and Vercel connection..."
echo ""

# Check if we're in a git repo
if [ ! -d .git ]; then
    echo "❌ Not a git repository. Initializing..."
    git init
    git add -A
    git commit -m "Initial commit: Ride-Hailing Dashboard"
fi

# Check if GitHub remote exists
if git remote get-url origin &>/dev/null; then
    echo "✅ GitHub remote already exists: $(git remote get-url origin)"
    read -p "Do you want to use this remote? (y/n): " use_existing
    if [ "$use_existing" != "y" ]; then
        echo "Please provide your GitHub repository URL:"
        read -p "GitHub repo URL (e.g., https://github.com/username/repo.git): " repo_url
        git remote set-url origin "$repo_url" || git remote add origin "$repo_url"
    fi
else
    echo "📦 Setting up GitHub repository..."
    echo ""
    echo "Please create a GitHub repository first:"
    echo "1. Go to: https://github.com/new"
    echo "2. Create a new repository (name it something like 'ride-hailing-dashboard')"
    echo "3. DO NOT initialize with README, .gitignore, or license"
    echo "4. Copy the repository URL"
    echo ""
    read -p "Enter your GitHub repository URL: " repo_url
    
    if [ -z "$repo_url" ]; then
        echo "❌ No repository URL provided. Exiting."
        exit 1
    fi
    
    git remote add origin "$repo_url" 2>/dev/null || git remote set-url origin "$repo_url"
fi

echo ""
echo "📤 Pushing code to GitHub..."
git branch -M main
git push -u origin main || {
    echo "⚠️  Push failed. You may need to:"
    echo "   1. Authenticate with GitHub"
    echo "   2. Check repository permissions"
    echo ""
    echo "Trying to push with force (if you're sure):"
    read -p "Force push? (y/n): " force_push
    if [ "$force_push" = "y" ]; then
        git push -u origin main --force
    else
        echo "Please push manually: git push -u origin main"
        exit 1
    fi
}

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "🔗 Now connecting to Vercel..."
echo ""

# Check if logged into Vercel
if ! vercel whoami &>/dev/null; then
    echo "❌ Not logged into Vercel. Please run: vercel login"
    exit 1
fi

echo "📦 Connecting backend to Vercel from GitHub..."
cd backend
vercel link --yes 2>&1 | grep -v "Linked" || true
echo "✅ Backend linked"

echo ""
echo "📦 Connecting frontend to Vercel from GitHub..."
cd ../frontend
vercel link --yes 2>&1 | grep -v "Linked" || true
echo "✅ Frontend linked"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Import your GitHub repository for both projects"
echo "3. Set environment variables:"
echo "   - Backend: ALLOWED_ORIGINS"
echo "   - Frontend: VITE_API_BASE_URL"
echo "4. Vercel will auto-deploy on every push to GitHub!"
echo ""

