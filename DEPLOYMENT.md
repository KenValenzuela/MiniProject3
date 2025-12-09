# Deployment Guide

This guide covers multiple deployment options for both the frontend and backend.

## 🎯 Quick Overview

- **Frontend**: React/Vite app - Easy to deploy on Vercel
- **Backend**: FastAPI app - Can deploy on Vercel (serverless) or other platforms

## 📦 Option 1: Deploy Everything on Vercel (Recommended if you only have Vercel)

### Prerequisites
- Vercel account (free tier works)
- Vercel CLI installed: `npm i -g vercel`

### Step 1: Deploy Backend to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

3. **Deploy backend**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked "Override settings?", choose **No** (first time)
   - Note the deployment URL (e.g., `https://your-backend.vercel.app`)

4. **Set environment variables** in Vercel dashboard:
   - Go to your project in Vercel dashboard
   - Settings → Environment Variables
   - Add: `ALLOWED_ORIGINS` = `https://your-frontend.vercel.app,http://localhost:5173`

5. **Important**: You need to upload the Excel file. Options:
   - **Option A**: Upload to a cloud storage (S3, Google Drive, etc.) and update `app.py` to fetch from URL
   - **Option B**: Include the file in the deployment (may hit size limits)
   - **Option C**: Convert Excel to JSON and include it in the repo

### Step 2: Deploy Frontend to Vercel

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Deploy frontend**:
   ```bash
   vercel
   ```

3. **Set environment variable** in Vercel dashboard:
   - Go to your frontend project in Vercel dashboard
   - Settings → Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://your-backend.vercel.app` (use the backend URL from Step 1)

4. **Redeploy** after setting environment variables:
   ```bash
   vercel --prod
   ```

### Limitations of Vercel Backend Deployment

⚠️ **Important Notes**:
- Vercel serverless functions have a **10-second timeout** on free tier
- Your backend loads data at startup, which might timeout
- Large Excel files may cause issues
- Consider converting Excel to JSON for faster loading

---

## 🚀 Option 2: Frontend on Vercel + Backend on Free Platform (Recommended)

This is the **best option** if you want reliable backend performance.

### Deploy Frontend to Vercel

1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set environment variable**:
   - In Vercel dashboard → Environment Variables
   - `VITE_API_BASE_URL` = `https://your-backend-url.com`

### Deploy Backend to Render (Free Tier Available)

1. **Create account** at [render.com](https://render.com)

2. **Create new Web Service**:
   - Connect your GitHub repository
   - Select `backend` folder as root directory
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - Environment: `Python 3`

3. **Set environment variables**:
   - `ALLOWED_ORIGINS` = `https://your-frontend.vercel.app,http://localhost:5173`

4. **Upload Excel file**:
   - Use Render's persistent disk or upload to cloud storage
   - Update `app.py` path if needed

### Alternative Backend Platforms

**Railway** (railway.app):
- Free tier available
- Easy deployment from GitHub
- Similar setup to Render

**Fly.io** (fly.io):
- Free tier available
- Good for Python apps
- More configuration needed

**PythonAnywhere** (pythonanywhere.com):
- Free tier available
- Traditional hosting
- Good for long-running processes

---

## 🔧 Option 3: Deploy Backend Locally + Frontend on Vercel

If you want to keep backend running on your machine:

1. **Use a tunneling service**:
   - [ngrok](https://ngrok.com): `ngrok http 8000`
   - [localtunnel](https://localtunnel.github.io/www/): `npx localtunnel --port 8000`
   - [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

2. **Update frontend environment variable**:
   - `VITE_API_BASE_URL` = your tunnel URL (e.g., `https://abc123.ngrok.io`)

3. **Deploy frontend to Vercel** as described above

---

## 📝 Configuration Files Created

The following files have been created/updated for deployment:

1. **`frontend/vercel.json`** - Vercel configuration for frontend
2. **`backend/vercel.json`** - Vercel configuration for backend (serverless)
3. **`frontend/.env.example`** - Environment variable template
4. **`frontend/src/api.js`** - Updated to use environment variables
5. **`backend/app.py`** - Updated CORS to use environment variables

---

## 🛠️ Manual Deployment Steps

### Frontend (Vercel)

```bash
cd frontend
vercel login
vercel
# Follow prompts
# Set VITE_API_BASE_URL in dashboard
vercel --prod
```

### Backend (Render)

1. Push code to GitHub
2. Connect repo to Render
3. Create new Web Service
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

### Backend (Railway)

1. Push code to GitHub
2. Connect repo to Railway
3. Create new project → Deploy from GitHub
4. Select `backend` folder
5. Railway auto-detects Python
6. Add environment variables
7. Deploy

---

## 🔍 Troubleshooting

### Frontend can't connect to backend

- Check CORS settings in backend
- Verify `VITE_API_BASE_URL` is set correctly
- Check browser console for errors
- Ensure backend is running and accessible

### Backend timeout on Vercel

- Vercel serverless functions have 10s timeout (free tier)
- Consider moving backend to Render/Railway
- Or optimize data loading (convert Excel to JSON)

### Excel file not found

- Ensure file path is correct
- For Vercel: Upload to cloud storage or convert to JSON
- For Render/Railway: Include in repo or use persistent storage

### Environment variables not working

- Vercel: Must redeploy after adding env vars
- Check variable names match exactly
- Use `vercel env pull` to test locally

---

## 📊 Recommended Setup

**Best for production:**
- Frontend: Vercel (free, fast, easy)
- Backend: Render or Railway (free tier, no timeout issues)

**Quick demo:**
- Frontend: Vercel
- Backend: ngrok tunnel to localhost

**All-in-one (if you only have Vercel):**
- Both on Vercel (but optimize backend for serverless)

---

## 🎯 Next Steps

1. Choose your deployment option
2. Deploy backend first and get the URL
3. Deploy frontend with backend URL as environment variable
4. Test the deployed application
5. Update CORS settings if needed

Need help with a specific platform? Check their documentation or ask for assistance!

