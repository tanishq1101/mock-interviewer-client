# Deploy to Vercel (no GitHub CLI)

This frontend is Vite + React and can be deployed directly from GitHub.

Target repo:
- `git@github.com:tanishq1101/mock-interviewer-client.git`

## 1) Push frontend code to the target repo

From this project root (`ai-mock-interviewer`), you can push only the `frontend/` folder to a branch on the target repo:

```bash
cd /Users/pratyushsinha/ai-mock-interviewer
chmod +x ./scripts/push_subdir_to_remote.sh
./scripts/push_subdir_to_remote.sh frontend git@github.com:tanishq1101/mock-interviewer-client.git main --force
```

> If you don't want to overwrite `main`, push to a separate branch first:
>
> `./scripts/push_subdir_to_remote.sh frontend git@github.com:tanishq1101/mock-interviewer-client.git frontend-only`

## 2) Import project in Vercel Dashboard

1. Go to Vercel Dashboard → **Add New...** → **Project**.
2. Import `tanishq1101/mock-interviewer-client`.
3. If this repo contains only frontend code:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. If deploying from monorepo directly (instead of frontend-only repo):
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

## 3) Set environment variables in Vercel

In **Project Settings → Environment Variables**, add:

- `VITE_CLERK_PUBLISHABLE_KEY` = your Clerk publishable key
- `VITE_API_URL` = `https://mock-interviewer-server.onrender.com/api`
- Optional: `VITE_BASE` = `/` (for Vercel)

## 4) Deploy

- Click **Deploy**.
- After first deploy, any push to the connected branch will trigger redeploy automatically.

## Notes

- `vercel.json` is already included for SPA routing (`/anything -> /index.html`), so React Router works on refresh and deep links.
