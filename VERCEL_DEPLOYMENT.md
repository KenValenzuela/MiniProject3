# Quick Vercel Deployment Guide

Since you only have Vercel, here's the simplest way to deploy both frontend and backend.

## ⚠️ Important Limitations

- Vercel serverless functions have a **10-second timeout** on free tier
- Your backend loads Excel data at startup, which might be slow
- Large files may cause deployment issues

## 🚀 Quick Start (Vercel Only)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy Backend First

```bash
cd backend
vercel login
vercel
```

**Follow the prompts:**
- Set up and deploy? **Yes**
- Which scope? (choose your account)
- Link to existing project? **No**
- Project name? (e.g., `ride-hailing-backend`)
- Directory? **./** (current directory)
- Override settings? **No**

**After deployment:**
- Note the URL (e.g., `https://ride-hailing-backend.vercel.app`)

**Set environment variable:**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your backend project
3. Go to Settings → Environment Variables
4. Add: `ALLOWED_ORIGINS` = `*` (or specific frontend URL later)

### Step 3: Deploy Frontend

```bash
cd ../frontend
vercel
```

**Follow the prompts:**
- Set up and deploy? **Yes**
- Which scope? (choose your account)
- Link to existing project? **No**
- Project name? (e.g., `ride-hailing-frontend`)
- Directory? **./** (current directory)
- Override settings? **No**

**After deployment:**
- Note the URL (e.g., `https://ride-hailing-frontend.vercel.app`)

**Set environment variable:**
1. Go to Vercel dashboard → Your frontend project
2. Settings → Environment Variables
3. Add: `VITE_API_BASE_URL` = `https://your-backend-url.vercel.app` (use your backend URL from Step 2)

**Redeploy frontend:**
```bash
vercel --prod
```

### Step 4: Update Backend CORS

1. Go to backend project in Vercel dashboard
2. Settings → Environment Variables
3. Update `ALLOWED_ORIGINS` = `https://your-frontend-url.vercel.app,http://localhost:5173`
4. Redeploy: `cd backend && vercel --prod`

## 🔧 Alternative: Use Render/Railway for Backend (Recommended)

If you encounter timeout issues with Vercel backend, use a free alternative:

### Render (Free Tier)

1. Sign up at [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `ALLOWED_ORIGINS` = `https://your-frontend.vercel.app`
6. Deploy

Then update frontend `VITE_API_BASE_URL` to your Render URL.

### Railway (Free Tier)

1. Sign up at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo
4. Add service → Select `backend` folder
5. Railway auto-detects Python
6. Add environment variable: `ALLOWED_ORIGINS` = `https://your-frontend.vercel.app`
7. Deploy

## 📝 What You Need

1. **Vercel account** (free)
2. **GitHub repository** (recommended, or deploy directly)
3. **Backend URL** (from Vercel or Render/Railway)
4. **Environment variables** set in both projects

## 🎯 Recommended Setup

**Best option:** Frontend on Vercel + Backend on Render/Railway
- No timeout issues
- Both free
- More reliable

**Vercel-only option:** Both on Vercel
- Quick setup
- May have timeout issues
- Need to optimize backend

## 🐛 Troubleshooting

**Backend timeout:**
- Move backend to Render/Railway
- Or optimize data loading (convert Excel to JSON)

**CORS errors:**
- Check `ALLOWED_ORIGINS` includes your frontend URL
- Redeploy backend after changing env vars

**Environment variables not working:**
- Must redeploy after adding env vars
- Check variable names match exactly
- Frontend: `VITE_API_BASE_URL`
- Backend: `ALLOWED_ORIGINS`

## 📚 Full Documentation

See `DEPLOYMENT.md` for detailed instructions for all platforms.

