# 🚀 Deploy Backend to Render

## Why Render?
- ✅ No timeout issues (unlike Vercel's 10s limit)
- ✅ Better for data processing
- ✅ Free tier available
- ✅ More reliable for this use case

## Step-by-Step Setup

### Step 1: Connect GitHub Repository

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub account** (if not already connected)
4. **Select repository**: `KenValenzuela/MiniProject3`
5. **Click "Connect"**

### Step 2: Configure Web Service

**Basic Settings:**
- **Name**: `ride-hailing-backend` (or any name you like)
- **Region**: Choose closest to you (e.g., Oregon)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **IMPORTANT: Set this to `backend`**

**Build & Deploy:**
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`

**Advanced Settings:**
- **Auto-Deploy**: `Yes` (deploys on every push to main)

### Step 3: Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

1. **ALLOWED_ORIGINS**:
   - Key: `ALLOWED_ORIGINS`
   - Value: `https://frontend-nbf72vv8k-ken-valenzuelas-projects.vercel.app,http://localhost:5173`
   - (Replace with your actual frontend URL)

2. Click **"Create Web Service"**

### Step 4: Wait for Deployment

- Render will:
  1. Clone your repository
  2. Install dependencies
  3. Start the server
  4. Give you a URL (e.g., `https://ride-hailing-backend.onrender.com`)

### Step 5: Update Frontend

Once backend is deployed on Render:

1. **Get your Render backend URL** (e.g., `https://ride-hailing-backend.onrender.com`)

2. **Update Frontend Environment Variable in Vercel**:
   - Go to: https://vercel.com/ken-valenzuelas-projects/frontend/settings/environment-variables
   - Update `VITE_API_BASE_URL` to your Render URL
   - Or add it if it doesn't exist

3. **Redeploy frontend** (Vercel will auto-redeploy)

## Configuration Summary

### Render Backend Settings

```
Name: ride-hailing-backend
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app:app --host 0.0.0.0 --port $PORT
Environment Variables:
  - ALLOWED_ORIGINS = https://your-frontend-url.vercel.app,http://localhost:5173
```

### Frontend Vercel Settings

```
VITE_API_BASE_URL = https://your-render-backend-url.onrender.com
```

## Verification

### Test Backend

1. Visit your Render backend URL
2. Should return: `{"message":"Ride-Hailing Analytics API","version":"2.0.0"}`
3. API Docs: `https://your-render-url.onrender.com/docs`

### Test Frontend

1. Visit your frontend
2. Open browser console (F12)
3. Should see API calls succeeding
4. Data should load properly

## Important Notes

- ⚠️ **Root Directory must be `backend`** - This tells Render where your code is
- ⚠️ **Start Command uses `$PORT`** - Render provides this automatically
- ⚠️ **First deployment takes 5-10 minutes** - Be patient!
- ⚠️ **Free tier spins down after 15 min inactivity** - First request after spin-down takes ~30 seconds

## Troubleshooting

### Build Fails
- Check that Root Directory is set to `backend`
- Verify `requirements.txt` is in the backend directory
- Check build logs in Render dashboard

### Backend Not Starting
- Check Start Command is correct
- Verify `app.py` is in the backend directory
- Check logs in Render dashboard

### CORS Errors
- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check that frontend `VITE_API_BASE_URL` points to Render URL

## Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **Your Services**: https://dashboard.render.com/web
- **Vercel Frontend Settings**: https://vercel.com/ken-valenzuelas-projects/frontend/settings/environment-variables

---

**Once deployed, your backend will be much more reliable than Vercel serverless!** 🎉

