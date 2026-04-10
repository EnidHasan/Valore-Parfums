# Valore Parfums Monorepo

This repository is split into independent applications:

- `frontend/`: Next.js storefront + admin UI (no local API routes)
- `backend/`: Next.js API service (`/api/*` route handlers)
- `shared/`: Shared libraries and types used by both apps

## Development

Install dependencies per app:

- `npm --prefix backend install`
- `npm --prefix frontend install`

Install root tooling once:

- `npm install`

Run both apps together (recommended):

- `npm run dev`

Run apps independently (optional):

- Backend: `npm run dev:backend` (http://localhost:3001)
- Frontend: `npm run dev:frontend` (http://localhost:3000)

Frontend API calls are proxied to backend via `NEXT_PUBLIC_API_BASE_URL`.

## Build

- `npm run build:backend`
- `npm run build:frontend`
- `npm run build`

## Environment

Set in `frontend/.env.local`:

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`

Set in `backend/.env.local`:

- Firebase admin credentials and service settings
- Optional: `ALLOWED_ORIGIN=http://localhost:3000`

## Deploy

### Frontend to Vercel

1. In Vercel, import this Git repo.
2. Set **Root Directory** to `frontend`.
3. Framework preset should auto-detect as **Next.js**.
4. Add the frontend environment variables below.
5. Set `NEXT_PUBLIC_API_BASE_URL` to your Render backend URL (example: `https://your-backend.onrender.com`).
6. Deploy.

Frontend environment variables used by the codebase:

- `NEXT_PUBLIC_API_BASE_URL`
	- Used by frontend API rewrites in `frontend/next.config.ts`.
	- This must point to the deployed backend, such as `https://your-backend.onrender.com`.
	- Without it, frontend requests to `/api/*` will keep targeting localhost in production.

- `NEXT_PUBLIC_FIREBASE_API_KEY`
	- Used by client-side Firebase auth in `frontend/src/lib/firebase-client.ts`.
	- Required for Google sign-in and any Firebase client usage.

- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
	- Used by client-side Firebase auth in `frontend/src/lib/firebase-client.ts`.
	- Required together with the API key and project ID.

- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
	- Used by client-side Firebase auth in `frontend/src/lib/firebase-client.ts`.
	- Also serves as the fallback Firebase project ID in server-side code.

- `NEXT_PUBLIC_FIREBASE_APP_ID`
	- Optional in `frontend/src/lib/firebase-client.ts`.
	- Safe to leave unset if your Firebase config does not need it, but keep it if your Firebase web app config includes an App ID.

- `NEXT_PUBLIC_SITE_URL`
	- Used by `frontend/src/lib/seo-catalog.ts` to build canonical URLs.
	- Set this to your public frontend domain, for example `https://your-frontend.vercel.app`.
	- This matters for SEO metadata, canonical links, and generated absolute URLs.
	- If you do not set it, the code falls back to the default production site URL in the repo.

Recommended backend-related frontend variable:

- `ALLOWED_ORIGIN`
	- This is read on the backend, not the frontend, but it must match the Vercel domain so browser requests are allowed.
	- Example: `https://your-frontend.vercel.app`.

### Backend to Render

1. In Render, create a new Web Service from this Git repo.
2. Set the **Root Directory** to `backend`.
3. Use the settings from `render.yaml` or set:
	- Build command: `npm install && npm run build`
	- Start command: `npm run start`
4. Add required backend environment variables from your local `backend/.env.local`.
5. Set `ALLOWED_ORIGIN` to your Vercel frontend domain (example: `https://your-frontend.vercel.app`).
6. Deploy.

If you use Render's Blueprint deploys, the repo already includes a `render.yaml` file for the backend service.

Backend health check endpoint:

- `GET /api/health`
