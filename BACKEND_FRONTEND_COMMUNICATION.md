# 🔗 Backend-Frontend Communication Guide

This guide ensures your backend can properly feed data to your frontend.

## 📊 Current Setup

### Backend
- **URL**: https://backend-dfp7dldto-ken-valenzuelas-projects.vercel.app
- **CORS**: Configured via `ALLOWED_ORIGINS` environment variable
- **Status**: ✅ Deployed and working

### Frontend
- **URL**: https://frontend-a7mvshdil-ken-valenzuelas-projects.vercel.app
- **API Connection**: Configured via `VITE_API_BASE_URL` environment variable
- **Status**: ✅ Deployed

## 🔧 Required Configuration

### 1. Backend CORS Configuration

**Purpose**: Allows your frontend to make API requests to the backend.

**Location**: Vercel Dashboard → Backend Project → Settings → Environment Variables

**Variable**:
- **Key**: `ALLOWED_ORIGINS`
- **Value**: `https://frontend-a7mvshdil-ken-valenzuelas-projects.vercel.app,http://localhost:5173`
  - Replace with your actual frontend URL
  - Include `http://localhost:5173` for local development
- **Environment**: Production (and Preview if needed)

**Direct Link**: https://vercel.com/ken-valenzuelas-projects/backend/settings/environment-variables

### 2. Frontend API URL Configuration

**Purpose**: Tells the frontend where to find the backend API.

**Location**: Vercel Dashboard → Frontend Project → Settings → Environment Variables

**Variable**:
- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://backend-dfp7dldto-ken-valenzuelas-projects.vercel.app`
  - Replace with your actual backend URL
- **Environment**: Production (and Preview if needed)

**Direct Link**: https://vercel.com/ken-valenzuelas-projects/frontend/settings/environment-variables

## 📝 Step-by-Step Setup

### Step 1: Get Your Deployment URLs

1. Go to: https://vercel.com/dashboard
2. Click on **backend** project
3. Copy the production URL (e.g., `https://backend-xxx.vercel.app`)
4. Click on **frontend** project
5. Copy the production URL (e.g., `https://frontend-xxx.vercel.app`)

### Step 2: Configure Backend CORS

1. Go to: https://vercel.com/ken-valenzuelas-projects/backend/settings/environment-variables
2. Click **"Add New"**
3. Enter:
   - **Key**: `ALLOWED_ORIGINS`
   - **Value**: `https://your-frontend-url.vercel.app,http://localhost:5173`
   - **Environment**: Select "Production"
4. Click **"Save"**

### Step 3: Configure Frontend API URL

1. Go to: https://vercel.com/ken-valenzuelas-projects/frontend/settings/environment-variables
2. Click **"Add New"**
3. Enter:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-url.vercel.app`
   - **Environment**: Select "Production"
4. Click **"Save"**

### Step 4: Wait for Auto-Redeploy

- Vercel will automatically trigger new deployments after you save environment variables
- Wait 1-2 minutes for deployments to complete
- Check the Deployments tab to see status

## ✅ Verification

### Test Backend

1. Visit your backend URL: `https://your-backend-url.vercel.app/`
2. Should return: `{"message":"Ride-Hailing Analytics API","version":"2.0.0"}`
3. API Docs: `https://your-backend-url.vercel.app/docs`

### Test Frontend

1. Visit your frontend URL: `https://your-frontend-url.vercel.app`
2. Open browser console (F12)
3. Check for:
   - ✅ No CORS errors
   - ✅ API calls being made
   - ✅ Data loading successfully
4. If you see errors:
   - Check that `VITE_API_BASE_URL` is set correctly
   - Check that `ALLOWED_ORIGINS` includes your frontend URL
   - Check browser console for specific error messages

### Test API Connection

Open browser console on your frontend and run:
```javascript
fetch('https://your-backend-url.vercel.app/timestamps')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Should return an array of timestamps without CORS errors.

## 🔍 How It Works

### Data Flow

```
1. Frontend loads → Reads VITE_API_BASE_URL
2. Frontend makes API call → GET ${VITE_API_BASE_URL}/timestamps
3. Backend receives request → Checks ALLOWED_ORIGINS
4. If origin matches → Returns data
5. Frontend receives data → Displays in UI
```

### Code Locations

**Backend CORS** (`backend/app.py` lines 96-105):
```python
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    ...
)
```

**Frontend API** (`frontend/src/api.js` line 4):
```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
```

## 🐛 Troubleshooting

### CORS Errors

**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**:
1. Check `ALLOWED_ORIGINS` includes your frontend URL exactly
2. Make sure there are no trailing slashes
3. Redeploy backend after changing environment variables

### API Connection Errors

**Error**: `Network Error` or `Failed to fetch`

**Solution**:
1. Check `VITE_API_BASE_URL` is set correctly
2. Verify backend URL is accessible (visit it directly)
3. Check browser console for specific error
4. Redeploy frontend after changing environment variables

### Data Not Loading

**Symptoms**: Frontend loads but shows no data

**Solution**:
1. Check browser console for API errors
2. Verify backend is returning data (visit API endpoint directly)
3. Check network tab to see if requests are being made
4. Verify environment variables are set for "Production" environment

## 📚 Quick Reference

### Environment Variables Summary

| Project | Variable | Purpose | Example Value |
|---------|----------|---------|---------------|
| Backend | `ALLOWED_ORIGINS` | Allow frontend to make requests | `https://frontend-xxx.vercel.app,http://localhost:5173` |
| Frontend | `VITE_API_BASE_URL` | Backend API location | `https://backend-xxx.vercel.app` |

### Important Notes

- ⚠️ **Environment variables must be set in Vercel dashboard** - they're not in your code
- ⚠️ **Changes require redeployment** - Vercel auto-redeploys when you save env vars
- ⚠️ **Use exact URLs** - No trailing slashes, include `https://`
- ⚠️ **Test after changes** - Always verify the connection works

## 🎯 Quick Setup Commands

Run this script to check your current setup:
```bash
./ensure-backend-frontend-communication.sh
```

---

**Once both environment variables are set correctly, your frontend will be able to communicate with your backend!** 🚀

