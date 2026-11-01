# Deployment Guide — TrafficGuard AI

TrafficGuard AI is architected as independently deployable services:

## 1. Frontend Web App (Vercel)

The Next.js/React frontend runs on Vercel with zero heavy dependencies:
1. Connect GitHub repository to Vercel.
2. Set Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://trafficguard-api.onrender.com`
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://your-supabase-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your_anon_key`
3. Build Command: `npm run build`
4. Deploy.

## 2. Computer Vision FastAPI Backend (Render / Cloud Run)

The Python computer vision service requires GPU or multi-core CPU compute:
1. Build with provided Dockerfile in `services/ai-api/Dockerfile`:
   ```bash
   cd services/ai-api
   docker build -t trafficguard-ai-api .
   docker run -p 8000:8000 --env-file .env trafficguard-ai-api
   ```
2. On Render:
   - Create a Web Service from the `services/ai-api` directory.
   - Environment: Docker
   - Instance Type: Standard (2GB+ RAM required for YOLOv8/EasyOCR) or GPU (A10G).
   - Set environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGINS`).

## 3. Database & Storage (Supabase)

1. Create a new Supabase project.
2. In SQL Editor, run `supabase/migrations/20261030000000_trafficguard_schema.sql`.
3. In SQL Editor, run `supabase/seed.sql` to populate cameras and baseline model telemetry.
4. In Storage, create a public or signed bucket named `traffic-evidence`.
