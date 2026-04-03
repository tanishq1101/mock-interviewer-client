# Deploying the frontend

This repository contains the frontend application under the `frontend/` directory. The repository includes a GitHub Actions workflow that will build the frontend and deploy it to GitHub Pages (the workflow file is at `.github/workflows/deploy-frontend.yml`).

How it works
- The workflow runs on `push` to `main`.
- It installs dependencies inside `frontend/`, runs `npm run build`, and publishes `frontend/dist` to the `gh-pages` branch.

What you need to do
1. Ensure this code is pushed to the repository `tanishq1101/mock-interviewer-client` (or update `VITE_BASE` in the workflow to match the repo name).
2. If the repo name is `mock-interviewer-client`, the build uses `VITE_BASE=/mock-interviewer-client/` so routes and assets resolve correctly on GitHub Pages. If you host under a custom domain or user page, update the workflow's `VITE_BASE` accordingly.
3. The Actions workflow uses the default `GITHUB_TOKEN` so no additional secrets are required to publish to `gh-pages`.

Quick local push (one-liner)
If you'd like to push the `frontend/` directory only into the target repo (for example to `main`), you can run the helper script we added from the repository root:

```
./scripts/push_frontend_to_remote.sh git@github.com:tanishq1101/mock-interviewer-client.git main
```

This uses `git subtree split` to create a temporary branch containing only `frontend/` history and force-pushes it to `main` on the remote. Use with care: it will force the remote branch to the frontend contents.

After pushing to `main`, open the repository's Actions tab and watch the `Deploy Frontend to GitHub Pages` workflow. When it completes it will push the built files to the `gh-pages` branch and GitHub Pages will serve them.

Notes
- If you prefer another hosting (Vercel, Netlify), I can add a separate workflow or configuration for those providers.
