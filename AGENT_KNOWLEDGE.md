# Agent Knowledge: TMUA Prep Platform

## 1) Project Purpose
- Full-stack TMUA prep platform with:
  - User auth (signup/login/JWT)
  - Practice quiz sessions
  - Membership plans and Stripe checkout
  - Admin dashboard for user/membership management

## 2) Tech Stack
- Frontend: React + TypeScript + Vite + Tailwind + Zustand
- Backend: Node.js + Express + Prisma
- Database: PostgreSQL
- Payments: Stripe Checkout
- API docs: Swagger UI (`/api-docs`)

## 3) Workspace Layout
- `client/` → frontend app
- `server/` → backend entrypoint and Prisma folder
- `server/src/` → controllers/routes/middleware/utils
- `prisma/` (root) and `server/prisma/` both exist; active backend schema and migrations are under `server/prisma/`

## 4) Runtime Entry Points
- Backend start file: `server/index.js`
  - Base URL default: `http://localhost:5000`
  - Mounted routes:
    - `/api/auth`
    - `/api/memberships`
    - `/api/questions`
    - `/api/sessions`
    - `/api/admin`
- Frontend start file: `client/src/main.tsx`
  - Router defined in `client/src/App.tsx`

## 5) Auth and Authorization
- JWT is created in `server/src/utils/auth.js` with 24h expiry.
- Middleware:
  - `authenticateToken` validates bearer token and sets `req.user`.
  - `requireAdmin` permits only `req.user.role === 'ADMIN'`.
- Client auth state in `client/src/store/authStore.ts`:
  - Token persisted in `localStorage`
  - `isAuthenticated` inferred from token presence
  - User object is not persisted across refresh

## 6) Data Model (Prisma)
Source: `server/prisma/schema.prisma`

- `User` (role: USER/ADMIN)
- `MembershipPlan`
- `UserMembership` (1:1 per user via unique `userId`)
- `Question` (stores options array and correct option index)
- `Session` (quiz session with score)
- `UserAnswer` (unique composite: `sessionId + questionId`)
- `Payment` (Stripe payment records)

## 7) Core API Behavior

### Auth
- `POST /api/auth/signup` → create user + return `{ token, user }`
- `POST /api/auth/login` → verify credentials + return `{ token, user }`
- `GET /api/auth/me` (auth) → returns user with membership

### Membership
- `GET /api/memberships/plans` (auth) → all plans
- `POST /api/memberships/checkout` (auth) → creates Stripe checkout session
- `POST /api/memberships/verify` (auth) → retrieves Stripe session, upserts active membership, records payment

### Questions
- `GET /api/questions/random` (auth) → random question excluding answer key
- `POST /api/questions` (admin) → add question

### Sessions
- `POST /api/sessions/start` (auth) → creates session
- `POST /api/sessions/answer` (auth) → one answer per question/session, updates score if correct
- `POST /api/sessions/end` (auth) → sets end time
- `GET /api/sessions/history` (auth) → recent sessions

### Admin
- `GET /api/admin/stats` (admin)
- `GET /api/admin/users` (admin)
- `POST /api/admin/revoke` (admin)
- `POST /api/admin/grant` (admin)

## 8) Frontend Page Map
- `/` → Home
- `/login` → Login form, calls `/auth/login`
- `/signup` → Signup form, calls `/auth/signup`
- `/dashboard` (protected) → membership status, plans, session history, payment verify callback
- `/quiz` (protected) → start session, fetch random question, submit answers
- `/admin` (protected) → admin stats and membership controls

## 9) Seed Data and Admin
- Seed script: `server/prisma/seed.js`
  - Creates 2 plans
  - Creates admin user: `admin@tmuaprep.com` / `admin123`
  - Creates sample question

## 10) Important Caveats for Future Agents
1. `server/src/utils/prismaClient.js` uses a hardcoded remote PostgreSQL URL instead of `DATABASE_URL`.
2. Checkout response mismatch:
   - Backend returns `{ id: session.id }` in `createCheckoutSession`
   - Frontend expects `data.url` and redirects only if URL exists
   - Result: checkout flow will not redirect without adjustment.
3. Dashboard links include routes not defined in router (e.g., `/profile`).
4. Session score is increment count of correct answers, but UI treats it as percentage in some places.
5. Root and server package versions for Prisma differ (`^7` at root, `^5` in server).

## 11) Environment Variables Expected
- Backend (`server`):
  - `PORT`
  - `JWT_SECRET`
  - `DATABASE_URL` (intended by Prisma schema, but currently bypassed by hardcoded URL in prisma client util)
  - `STRIPE_SECRET_KEY`
  - `CLIENT_URL`
- Frontend (`client`):
  - `VITE_API_URL` (expected as base API URL, e.g. `http://localhost:5000/api`)

## 12) Fast Local Run Reference
1. Start DB (Postgres)
2. In `server/`: install deps, run migrations, run seed, then `npm run dev`
3. In `client/`: install deps, set `VITE_API_URL`, then `npm run dev`

## 13) Best First Tasks for Any New Agent
1. Fix checkout session response/redirect contract.
2. Move Prisma client DB URL to env-driven config.
3. Normalize score display (raw count vs percentage).
4. Add role-aware route guard for `/admin` in router layer.
5. Add `.env.example` files for server/client with required keys.