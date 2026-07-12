<div align="center">

# 🚛 TransitOps

**A full-stack fleet & transit operations management platform**

Built with Node.js · Express · Prisma · PostgreSQL · React · TypeScript · Vite

</div>

---

## Overview

TransitOps is a role-based fleet operations dashboard that gives logistics teams a unified interface to manage vehicles, drivers, trips, maintenance, fuel costs, and analytics — all in real time.

Four distinct user roles each get a tailored view: Fleet Managers track assets and analytics, Dispatchers create and monitor trips, Safety Officers manage driver compliance, and Financial Analysts track fuel costs and ROI.

---

## Screenshots

| Dashboard | Fleet Registry |
|---|---|
| Live trip board, vehicle status donut, KPI cards | Sortable vehicle table with reg-number badges |

| Trips | Role-Based Sidebar |
|---|---|
| Lifecycle dispatch form + live board | Filtered nav with View-only badges per role |

---

## Features

### 🔐 Role-Based Access Control (RBAC)
Four roles with enforced module access — blocked routes redirect automatically, view-only modules disable all write actions:

| Module | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
|---|:---:|:---:|:---:|:---:|
| Dashboard | View | **Full** | View | View |
| Fleet | **Full** | View 👁 | — | View 👁 |
| Drivers | **Full** | — | **Full** | — |
| Trips | — | **Full** | View 👁 | — |
| Maintenance | **Full** | — | — | — |
| Fuel & Expenses | — | — | — | **Full** |
| Analytics | **Full** | — | — | **Full** |
| Settings | **Full** | View 👁 | View 👁 | View 👁 |

### 📊 Dashboard
- KPI cards: Active Vehicles, Available, In Maintenance, Active Trips, Pending Trips, Drivers on Duty, Fleet Utilisation %
- Vehicle Status distribution bar
- Live trip board with search and status filters
- Quick-dispatch modal

### 🚗 Fleet Management
- Full vehicle registry with sortable columns (Reg No, Model, Odometer, Acquisition Cost)
- License-plate styled registration number badges (`whitespace-nowrap` monospace pill)
- Responsive: card grid on mobile, table on desktop (`md+`)
- Status filter: Available / On Trip / In Shop / Retired
- Add Vehicle modal with validation

### 👤 Driver Management
- Driver profiles with license category, expiry date, safety score, and status
- License expiry detection — expired/suspended drivers blocked from trip assignment
- Add, edit, and update driver status

### 📦 Trip Management
- Lifecycle stepper: Draft → Dispatched → Completed / Cancelled
- Create trip form with vehicle & driver selectors, cargo weight, planned distance
- Live board with search + status filter
- Safety Officers see read-only board (no create/modify form)

### 🔧 Maintenance
- Log maintenance events per vehicle with cost and date range
- Open / Closed status tracking

### ⛽ Fuel & Expenses
- Fuel log entries linked to vehicles and trips
- Expense categorisation: Fuel, Maintenance, Toll, Other
- Cost tracking for Financial Analysts

### 📈 Analytics
- Fleet utilisation charts
- Vehicle ROI tracking
- Cost breakdown visualisations

### ⚙️ Settings
- Depot name, currency, and distance unit configuration
- RBAC matrix reference table
- View-only for non-Fleet-Manager roles

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (`jsonwebtoken`) |
| Validation | Zod |
| Config | dotenv |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| HTTP | Fetch API (custom `api` util) |
| Routing | State-based tab routing |

---

## Database Schema

```
User          — id, name, email, password, role (FLEET_MANAGER | DISPATCHER | SAFETY_OFFICER | FINANCIAL_ANALYST)
Vehicle       — registrationNumber, model, type, capacityKg, odometer, acquisitionCost, region, status
Driver        — name, licenseNumber, licenseCategory, licenseExpiry, phone, safetyScore, status
Trip          — trackingNumber, vehicleId, driverId, cargoWeightKg, plannedDistance, revenue, startLocation, endLocation, status
Maintenance   — vehicleId, description, cost, startDate, endDate, status, loggedById
FuelLog       — vehicleId, tripId, amountLiters, cost, odometer, date
Expense       — vehicleId, tripId, category, amount, description, date
ActivityLog   — userId, action, entityType, entityId, message
```

Enums: `VehicleStatus`, `DriverStatus`, `TripStatus`, `MaintenanceStatus`, `ExpenseCategory`

---

## Project Structure

```
transitops/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database models & enums
│   │   ├── seed.js              # Sample data seeder
│   │   └── migrations/          # Prisma migration history
│   └── src/
│       ├── server.js            # Express entry point
│       ├── app.js               # App setup, middleware registration
│       ├── config/
│       │   └── database.js      # Prisma client singleton
│       ├── controllers/         # Request handlers per domain
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── vehicle.routes.js
│       │   ├── driver.routes.js
│       │   ├── trip.routes.js
│       │   ├── maintenance.routes.js
│       │   ├── expense.routes.js
│       │   └── dashboard.routes.js
│       ├── services/            # Business logic layer
│       ├── middleware/          # Auth, error handling
│       └── utils/               # Helpers
│
└── frontend/
    └── src/
        ├── App.tsx              # Root layout, routing, auth state
        ├── components/
        │   ├── Navbar.tsx       # Top bar with search, profile, hamburger
        │   └── Slidebar.tsx     # RBAC-filtered sidebar navigation
        ├── pages/
        │   ├── AuthPage.tsx     # Login with role selector
        │   ├── Dashboard.tsx    # KPI cards + live board
        │   ├── fleet.tsx        # Vehicle registry
        │   ├── Drivers.tsx      # Driver management
        │   ├── Trips.tsx        # Trip lifecycle
        │   ├── Maintenance.tsx  # Maintenance logs
        │   ├── FuelExpenses.tsx # Fuel & expense tracking
        │   ├── Analytics.tsx    # Charts & ROI
        │   └── Settings.tsx     # Depot config + RBAC reference
        └── utils/
            ├── api.ts           # API client helpers
            └── permissions.ts   # RBAC permission matrix & helpers
```

---

## Getting Started

### Prerequisites
- **Node.js** 18+
- **PostgreSQL** (local or remote)
- **npm** or **yarn**

### 1. Clone & install

```bash
git clone https://github.com/your-org/transitops.git
cd transitops
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file (copy the template below):

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/transitops?schema=public"

# Auth
JWT_SECRET="your_secret_key_here"
JWT_EXPIRES_IN="90d"
```

Run database setup:

```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run migrations (creates schema)
npm run db:seed       # Seed sample vehicles, drivers, trips
npm run dev           # Start dev server → http://localhost:5000
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
npm run dev           # Start Vite dev server → http://localhost:5173
```

### 4. Demo credentials

Log in from the AuthPage using any of the seeded accounts:

| Role | Email | Password |
|---|---|---|
| Fleet Manager | `manager@transitops.com` | `password123` |
| Dispatcher | `dispatcher@transitops.com` | `password123` |
| Safety Officer | `safety@transitops.com` | `password123` |
| Financial Analyst | `analyst@transitops.com` | `password123` |

---

## API Reference

All routes are prefixed with `/api`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/vehicles` | List all vehicles |
| `POST` | `/api/vehicles` | Register a new vehicle |
| `GET` | `/api/vehicles/:id` | Get vehicle by ID |
| `PATCH` | `/api/vehicles/:id` | Update vehicle |
| `GET` | `/api/drivers` | List all drivers |
| `POST` | `/api/drivers` | Add a driver |
| `GET` | `/api/trips` | List trips |
| `POST` | `/api/trips` | Create a trip |
| `POST` | `/api/trips/:id/dispatch` | Dispatch a trip (DRAFT → DISPATCHED) |
| `POST` | `/api/trips/:id/complete` | Complete a trip |
| `POST` | `/api/trips/:id/cancel` | Cancel a trip |
| `GET` | `/api/maintenance` | List maintenance records |
| `POST` | `/api/maintenance` | Log a maintenance event |
| `GET` | `/api/expenses` | List expenses |
| `POST` | `/api/expenses` | Log an expense |
| `GET` | `/api/dashboard` | Aggregated dashboard stats |

---

## Available Scripts

### Backend (`cd backend`)

| Script | Description |
|---|---|
| `npm run dev` | Start Express with nodemon |
| `npm run start` | Production start |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Seed sample data |

### Frontend (`cd frontend`)

| Script | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production bundle → `dist/` |
| `npm run preview` | Preview the production build |

---

## RBAC Implementation

The permission system lives in [`frontend/src/utils/permissions.ts`](frontend/src/utils/permissions.ts).

```ts
getAccess(role, module)      // → 'full' | 'view' | 'none'
getAllowedModules(role)       // → AppModule[]
getDefaultTab(role)          // → first accessible module
```

- **`none`** — nav item hidden from sidebar, direct navigation redirects to default tab
- **`view`** — nav item visible with 👁 badge; write actions (buttons, forms) are hidden/disabled
- **`full`** — complete CRUD access

---

## Production Build

```bash
# Frontend
cd frontend && npm run build
# Serve dist/ with nginx, Vercel, or any static host

# Backend
cd backend && npm run start
# Ensure DATABASE_URL and JWT_SECRET are set in production env
```

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Made with ☕ for college project · TransitOps 2026
</div>
