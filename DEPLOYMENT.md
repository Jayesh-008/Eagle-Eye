# Eagle Eye - Fullstack Deployment Guide

This guide details how to deploy the **Eagle Eye** fullstack e-commerce web application (React Frontend + Node/Express Backend + PostgreSQL Database) to production on **Render** (and optionally Vercel/Netlify).

---

## 🚀 Quick Deployment Architecture

The application is configured to run as a **unified fullstack web service** on Render:
- **Express Backend** handles API requests at `/api/*` and database operations.
- **Production React SPA** (`dist/` folder) is built during deployment and served directly by Express for all other routes.
- **Single Host / Zero CORS Issues**: Both frontend and backend share `https://eagle-eye-backend-tld9.onrender.com`.

---

## 🛠️ Step 1: Render Web Service Settings

In your Render Dashboard for service **`eagle-eye-backend`**:

1. **Build & Start Commands**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

2. **Environment Variables**:
   Go to **Environment** tab in your Render Web Service and set:
   | Variable | Recommended Value | Notes |
   |---|---|---|
   | `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname` | Render Postgres connection string (or Supabase / Neon / Railway) |
   | `JWT_SECRET` | `your_random_secret_key_123` | Secure secret string for JWT authentication |
   | `NODE_ENV` | `production` | Enables production optimizations & SSL database connection |
   | `PORT` | `10000` | Render default port |

---

## 🗄️ Step 2: Database Initialization & Seeding

The database schema (`backend/models/schema.sql`) automatically initializes upon server startup when connected to PostgreSQL.

To seed initial categories, products, admin account, and demo data:
1. Go to your Render Web Service **Shell** tab (or connect via CLI).
2. Run:
   ```bash
   npm run seed
   ```

---

## 🌐 Option B: Deploying Frontend Separately (Vercel / Netlify / Render Static Site)

If you prefer hosting the React frontend on Vercel or Netlify while keeping the backend on Render:

1. Deploy the root directory to Vercel/Netlify.
2. Build Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment Variable:
   - `VITE_API_URL`: `https://eagle-eye-backend-tld9.onrender.com/api`

---

## ✅ Health Check

Once deployed, test your live backend status at:
`https://eagle-eye-backend-tld9.onrender.com/api/health`

Expected response:
```json
{
  "status": "ok",
  "message": "Eagle Eye API is running.",
  "db": "PostgreSQL connected ✅"
}
```
