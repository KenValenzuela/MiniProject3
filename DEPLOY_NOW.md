# 🚀 Quick Deployment Instructions

I've prepared everything for you! Here's what you need to do:

## Step 1: Login to Vercel (One-time setup)

Run this command in your terminal:

```bash
vercel login
```

This will:
- Open your browser
- Ask you to log in to Vercel (or create a free account)
- Complete authentication

**You only need to do this once!**

## Step 2: Run the Deployment Script

After logging in, run:

```bash
./deploy.sh
```

This script will:
1. ✅ Check if you're logged in
2. 📦 Deploy backend to Vercel
3. 📦 Deploy frontend to Vercel
4. 🔗 Try to link them together

## Step 3: Manual Configuration (if needed)

After deployment, you may need to:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Backend Project**:
   - Settings → Environment Variables
   - Add/Update: `ALLOWED_ORIGINS` = `https://your-frontend-url.vercel.app,http://localhost:5173`
3. **Frontend Project**:
   - Settings → Environment Variables  
   - Add/Update: `VITE_API_BASE_URL` = `https://your-backend-url.vercel.app`
4. **Redeploy** both projects after setting environment variables

## Alternative: Manual Deployment

If the script doesn't work, you can deploy manually:

### Deploy Backend:
```bash
cd backend
vercel --prod
# Note the URL it gives you
```

### Deploy Frontend:
```bash
cd frontend
vercel env add VITE_API_BASE_URL production
# Paste your backend URL when prompted
vercel --prod
```

Then update CORS in backend as described above.

## What I've Already Done ✅

- ✅ Installed Vercel CLI
- ✅ Initialized git repository
- ✅ Created Vercel configuration files
- ✅ Updated code to use environment variables
- ✅ Created deployment script
- ✅ Committed all changes

## Need Help?

- Check `VERCEL_DEPLOYMENT.md` for detailed instructions
- Check `DEPLOYMENT.md` for alternative platforms

---

**Ready? Just run `vercel login` then `./deploy.sh`!**

