# EasyPanel Deployment (Docker Compose + Auto Deploy Webhook)

## 1) Prepare repository
- Ensure this project is pushed to GitHub (main branch).
- In GitHub repo settings, add Actions secret:
  - `EASYPANEL_DEPLOY_WEBHOOK_URL` = your EasyPanel deploy webhook URL.

## 2) Create app in EasyPanel
1. In EasyPanel, create a new **Docker Compose** app.
2. Connect your GitHub repository.
3. Set compose path to `docker-compose.yml`.
4. Set branch to `main`.
5. Add environment variables (from `.env.example`):
   - `POSTGRES_DB`
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `JWT_SECRET`
   - `STRIPE_SECRET_KEY` (optional)
   - `CLIENT_URL` (your public frontend URL)
6. Expose port **80** for the `client` service.

## 3) Deploy webhook (auto deploy on each push)
1. In EasyPanel app settings, copy the **Deploy Webhook URL**.
2. In GitHub repository → Settings → Secrets and variables → Actions, create:
   - `EASYPANEL_DEPLOY_WEBHOOK_URL` with copied URL.
3. Workflow file already exists at `.github/workflows/easypanel-auto-deploy.yml`.
4. Every push to `main` triggers this webhook and starts deployment.

## 4) Notes specific to this project
- Frontend is served by Nginx and proxies API via `/api` to backend service.
- Backend runs Prisma migration on startup:
  - `npx prisma migrate deploy --schema prisma/schema.prisma`
- Keep sensitive values only in EasyPanel env vars, not in repository files.

## 5) First deployment checks
- Open your domain and verify homepage loads.
- Test API docs at `/api-docs` via backend route through your domain if needed.
- Login with admin and verify Admin Settings + Homepage CMS functionality.
