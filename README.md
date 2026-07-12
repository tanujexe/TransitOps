# TransitOps

TransitOps is a lightweight transit operations management system that provides a foundation for tracking vehicles, trips, drivers, fuel and maintenance events, and expense workflows. This repository contains a Node.js/Express backend and a Vite + React (TypeScript) frontend.

**Key features**
- Dashboard and analytics pages
- Drivers, trips, fleet, fuel expense and maintenance management pages
- REST API with authentication-ready structure (JWT-ready)
- Database migrations and seed support via Prisma

**Repository layout**
- `backend/` — Node.js + Express API, Prisma schema and migration scripts
- `frontend/` — Vite + React (TypeScript) single-page app

**Tech stack**
- Backend: Node.js, Express, Prisma, PostgreSQL, dotenv, Zod, JWT
- Frontend: React, TypeScript, Vite, Tailwind CSS

Getting started
---------------

Prerequisites
- Node.js 18+ and npm (or yarn)
- PostgreSQL (for local development)

Quick start (development)

1. Backend

	- Create a `.env` in the `backend` folder and set `DATABASE_URL` (and any other secrets like `JWT_SECRET`):

```bash
cd backend
npm install
# copy .env.example to .env and edit values
# generate prisma client
npm run db:generate
# run migrations (creates local DB schema)
npm run db:migrate
# seed sample data (if provided)
npm run db:seed
# start dev server
npm run dev
```

	- Database configuration lives at [backend/src/config/database.js](backend/src/config/database.js#L1).

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

3. Open the frontend dev server (Vite will print the URL, usually `http://localhost:5173`).

Production build

- Frontend: `cd frontend && npm run build` then serve the `dist` output using any static server.
- Backend: `cd backend && npm run start` (ensure environment variables are set and database is reachable).

Database tasks (Prisma)
- Generate client: `npm run db:generate` (backend)
- Run migrations: `npm run db:migrate` (backend)
- Seed data: `npm run db:seed` (backend)

Scripts (where to run)
- Start backend dev server: `backend` -> `npm run dev`
- Start frontend dev server: `frontend` -> `npm run dev`
- Build frontend: `frontend` -> `npm run build`

Configuration
- Backend environment variables should include at minimum: `DATABASE_URL`, `PORT` (optional), and `JWT_SECRET` (if enabling auth).
- See [backend/src/config/database.js](backend/src/config/database.js#L1) for DB setup details.

Contributing
------------

- Please open an issue for bugs or feature requests.
- For code changes, fork the repo, create a branch, and submit a pull request with a clear description and tests where applicable.

Useful links
- Backend entry: [backend/src/server.js](backend/src/server.js#L1)
- Frontend entry: [frontend/src/main.tsx](frontend/src/main.tsx#L1)

License
-------

This project does not include a license file. Add a `LICENSE` if you intend to make the code public under an explicit license.

Questions or next steps
----------------------
- Want me to add a `.env.example`, CI workflow, or Dockerfiles for local development? I can scaffold those next.

