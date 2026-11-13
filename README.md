# Kivo — Curated Modern E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-ISC-emerald.svg)](LICENSE)

**Kivo** is a complete, production-grade e-commerce web application engineered for modern lifestyle, acoustic tech, and homeware retail. Designed with Scandinavian minimalism and a light-first shopping aesthetic, Kivo features real-time inventory checks, server-authoritative cart pricing, atomic order transactions, secure role-based access control, and an executive administration dashboard.

---

## Table of Contents

1. [Executive Summary & Core Highlights](#executive-summary--core-highlights)
2. [Technology Stack](#technology-stack)
3. [Architecture & Folder Structure](#architecture--folder-structure)
4. [Design System & Theme](#design-system--theme)
5. [Database Architecture & Persistence](#database-architecture--persistence)
6. [Prerequisites & Requirements](#prerequisites--requirements)
7. [Quick Start & Setup Instructions (Windows)](#quick-start--setup-instructions-windows)
8. [Available Scripts](#available-scripts)
9. [Pre-Seeded Accounts & Demo Evaluation](#pre-seeded-accounts--demo-evaluation)
10. [REST API Specification](#rest-api-specification)
11. [Security & Architectural Safeguards](#security--architectural-safeguards)
12. [Testing & Quality Assurance](#testing--quality-assurance)
13. [Switching to PostgreSQL](#switching-to-postgresql)
14. [Known Limitations & Production Roadmap](#known-limitations--production-roadmap)

---

## 1. Executive Summary & Core Highlights

- **Branded Storefront**: Curated hero section, dynamic category showcases, trending articles, verified rating aggregations, and responsive product grids.
- **Server-Authoritative Pricing & Stock**: The frontend never determines prices or inventory totals. All item unit costs, promo discounts, and available stock are validated on the server within atomic database transactions.
- **Hybrid Guest & Authenticated Cart**: Instant client-side cart for guest visitors that synchronizes with the user's database cart upon authentication.
- **Atomic Checkout & Order Processing**: Prisma transactions guarantee that product stock is decremented and orders/payments are created simultaneously, avoiding overselling.
- **Developer Payment Simulator**: Built-in test payment engine with simulated approval and deliberate failure modes to verify error handling and rollbacks without external API keys.
- **Administrative Operations Console**: Dedicated management dashboard for store metrics (gross revenue, order counts, customer registrations, low-stock alerts), product CRUD, and order fulfillment tracking.
- **Light-First Responsive UX**: Warm neutral surfaces (`#f8fafc`), crisp card elevation, deep teal branding (`#0f766e`), and an optional dark mode toggle with preference persistence.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS & PostCSS
- **Icons**: Lucide React
- **State Management**: React Context (`AuthContext`, `CartContext`, `ThemeContext`)
- **Testing**: Vitest & React Testing Library with JSDOM

### Backend
- **Runtime**: Node.js (ES Modules)
- **Web Framework**: Express.js
- **Security & Middleware**: Helmet, CORS, Cookie-Parser, Express-Rate-Limit
- **Authentication**: JSON Web Tokens (JWT) stored in secure HTTP-only cookies with header fallback, bcrypt password hashing
- **Database & ORM**: Prisma ORM with SQLite for instant zero-dependency local development and full PostgreSQL schema/migrations for production deployment
- **Testing**: Vitest & Supertest

---

## 3. Architecture & Folder Structure

```
Kivo/
├── package.json              # Root coordination scripts (concurrent run, setup, tests)
├── .env.example              # Environment variables template
├── .gitignore                # Production ignore rules
├── README.md                 # Project documentation
├── prisma/
│   ├── schema.prisma         # Active Prisma schema (SQLite dev / PostgreSQL prod)
│   ├── schema.postgresql.prisma # PostgreSQL production schema
│   ├── seed.js               # Comprehensive database seed script
│   └── dev.db                # Local disk-backed SQLite database (auto-generated)
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── app.js            # Express app configuration & middleware
│   │   ├── server.js         # HTTP server entrypoint
│   │   ├── config/           # Environment configuration loaders
│   │   ├── lib/              # Prisma client singleton
│   │   ├── middleware/       # Auth guards, rate limiting, validators, error handlers
│   │   ├── controllers/      # Auth, product, cart, order, and admin controllers
│   │   └── routes/           # REST API route endpoints
│   └── tests/
│       ├── setup.js          # Test environment bootstrap
│       └── api.test.js       # End-to-end API test suite (Supertest)
└── client/
    ├── package.json
    ├── vite.config.js        # Vite dev server with reverse proxy
    ├── tailwind.config.js    # Custom brand color palette & typography
    ├── index.html            # HTML document & Google Fonts
    └── src/
        ├── main.jsx          # React DOM root
        ├── App.jsx           # Routing & layout configuration
        ├── index.css         # Tailwind base directives & custom scrollbars
        ├── context/          # Auth, Cart, and Theme providers
        ├── services/         # API integration client services
        ├── components/       # Common atoms, product cards, filters, and mini-cart drawer
        ├── layouts/          # Root storefront and Admin sidebar layouts
        └── pages/            # Customer storefront, checkout, and admin pages
```

---

## 4. Design System & Theme

Kivo implements a modern, light-first shopping interface:
- **Background**: Soft warm slate (`#f8fafc` / `#fafaf9`)
- **Card Surfaces**: Pure white (`#ffffff`) with subtle borders (`border-slate-200/80`) and soft shadows
- **Primary Brand Accent**: Deep Teal (`#0f766e` / `#0d9488`) symbolizing mindful craftsmanship and longevity
- **Typography**: Plus Jakarta Sans / Inter with clean tracking
- **Dark Mode**: Fully supported via Tailwind's `class` strategy with toggle button in header and `localStorage` persistence.

---

## 5. Database Architecture & Persistence

The application utilizes a normalized relational database schema structured through Prisma:

- **`User`**: Account identity, hashed passwords, timestamps, and role-based permissions (`CUSTOMER` or `ADMIN`).
- **`Address`**: Saved shipping destinations with default address management.
- **`Category`**: Department taxonomies with custom slugs and descriptions.
- **`Product`**: SKU, price, optional MSRP compareAtPrice, live inventory count, image galleries (JSON array), and rating summaries.
- **`Cart` & `CartItem`**: Persistent server cart items linked to customer accounts.
- **`Order`**: Authoritative order numbers (`KV-YEAR-XXXXX`), status transitions, calculated subtotal, delivery fee, tax, discount, snapshot of shipping address JSON, and payment status.
- **`OrderItem`**: Historical snapshot preserving product name, SKU, thumbnail, and unit price as paid at purchase time.
- **`Payment`**: Transaction logs, provider records, status (`COMPLETED`, `PENDING`, `FAILED`), and audit metadata.
- **`Review`**: Customer ratings (1-5 stars) and verified purchase reviews.

> **Honest Database Persistence Notice**:
> Out of the box on Windows developer machines where PostgreSQL is not yet locally installed or active on port 5432, Kivo runs on disk-backed SQLite via Prisma (`prisma/dev.db`). This provides **real SQL persistence**, foreign keys, relations, transactions, and seed data without mocks. For PostgreSQL production deployment, simply update `DATABASE_URL` in `.env` and deploy the schema.

---

## 6. Prerequisites & Requirements

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- **Docker Desktop**: Required on Windows for automated containerized PostgreSQL (`kivo-postgres`)
- **Operating System**: Windows 10/11, macOS, or Linux

---

## 7. One-Command Development Workflow (`npm run dev`)

Kivo is engineered for a seamless single-command developer experience. Once initial setup is completed, **you do not need to open three terminals** or run separate commands for the database, backend, and frontend.

### Initial One-Time Setup (Windows)

1. **Install Docker Desktop for Windows**:
   - Download: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Start Docker Desktop and ensure the whale indicator shows **"Engine running"**.
2. **Install Project Dependencies**:
   ```powershell
   npm run install:all
   ```

### Daily Development Startup

Simply run **one command** from the project root:

```powershell
npm run dev
```

#### What `npm run dev` does automatically:
1. **Verifies Environment**: Validates your `.env` configuration (auto-creates from `.env.example` if missing).
2. **Verifies Docker**: Inspects the local Docker engine and confirms Docker Desktop is active.
3. **Starts PostgreSQL Database**: Launches the `kivo-postgres` container using `docker-compose.yml` on port `5432` with a persistent named volume (`kivo_postgres_data`).
4. **Waits for Database Health**: Actively probes PostgreSQL's health check (`pg_isready`) until the database is ready to accept connections.
5. **Applies Prisma Migrations**: Safely applies pending schema migrations to PostgreSQL (`npx prisma migrate deploy`) without data loss.
6. **Launches Applications Concurrently**:
   - `[api]` **Express Backend**: [http://localhost:5000](http://localhost:5000) (Health: `/api/health`)
   - `[client]` **Vite React Frontend**: [http://localhost:5173](http://localhost:5173)
7. **Graceful Fault Tolerance**: Displays distinct colored tags (`[api]` and `[client]`). If either service exits with an error, the failure is immediately obvious and cleanly halts the dependent processes.

### Stopping the Development Environment

When you are done developing:
- Press `Ctrl + C` in the running terminal to terminate the frontend and backend servers.
- Run `npm run dev:stop` to cleanly stop and remove the PostgreSQL container:
  ```powershell
  npm run dev:stop
  ```

---

## 8. Available Scripts

From the root project directory:

| Command | Purpose |
| :--- | :--- |
| **`npm run dev`** | **Master one-command startup**: boots Docker PostgreSQL, waits for health check, migrates schema, and launches frontend + backend concurrently |
| **`npm run dev:stop`** | Cleanly stops the Docker PostgreSQL container (`docker compose down`) |
| `npm run dev:services` | Runs Express backend and Vite frontend concurrently without Docker orchestrator |
| `npm run dev:server` | Runs Express backend independently with nodemon |
| `npm run dev:client` | Runs Vite React frontend dev server independently |
| `npm run build` | Compiles the production frontend bundle into `client/dist` |
| `npm test` | Executes backend API integration tests with Supertest and Vitest |
| `npm run test:client` | Executes frontend unit tests with Vitest |
| `npm run db:migrate` | Applies pending Prisma migrations to PostgreSQL (`npx prisma migrate deploy`) |
| `npm run db:seed` | Seeds database with 17+ realistic products, categories, reviews, and demo users |
| `npm run db:setup` | Runs `npm run db:migrate` followed by `npm run db:seed` |
| `npm run db:generate` | Regenerates Prisma Client types |

---

## 9. Pre-Seeded Accounts & Demo Evaluation

The seed script creates two pre-configured accounts:

### 1. Demo Customer
- **Email**: `sarah.mitchell@example.com`
- **Password**: `Customer123!`
- **Role**: `CUSTOMER`
- **Features**: Includes pre-saved addresses, cart synchronization, and historical delivered order `KV-2026-98421`.

### 2. Store Administrator
- **Email**: `admin@kivo.com`
- **Password**: `AdminPassword123!`
- **Role**: `ADMIN`
- **Features**: Unlocks the `/admin` Operations Console, revenue metrics, SKU creation, and order status overrides.

> **Evaluation Tip**: On the `/login` page, click either **Demo Customer** or **Administrator** to auto-fill credentials with one click.

---

## 10. REST API Specification

### Health & Diagnostics
- `GET /api/health` — System status, database connection state, and timestamp.

### Authentication & Profiles
- `POST /api/auth/register` — Create a new customer profile.
- `POST /api/auth/login` — Authenticate and receive JWT cookie & bearer token.
- `POST /api/auth/logout` — Clear session cookies.
- `GET /api/auth/me` — Retrieve current authenticated user profile.
- `POST /api/auth/forgot-password` — Request password reset link.

### Addresses
- `GET /api/users/addresses` — List saved shipping destinations.
- `POST /api/users/addresses` — Save new shipping address.
- `PUT /api/users/addresses/:id` — Update existing address.
- `DELETE /api/users/addresses/:id` — Remove address.

### Products & Categories
- `GET /api/products` — Filterable catalogue (category, search, minPrice, maxPrice, inStock, sort, pagination).
- `GET /api/products/featured` — Top-rated featured product drops.
- `GET /api/products/:identifier` — Single product details with related items and reviews.
- `POST /api/products/:id/reviews` — Submit verified customer review.
- `GET /api/categories` — Department categories with product counts.

### Cart & Checkout
- `GET /api/cart` — User's cart with recalculation of prices and available stock.
- `POST /api/cart/add` — Add item to cart with stock validation.
- `PUT /api/cart/items/:itemId` — Modify item quantity.
- `DELETE /api/cart/items/:itemId` — Remove item from cart.
- `DELETE /api/cart/clear` — Empty cart.
- `POST /api/cart/sync` — Merge guest items upon sign-in.
- `POST /api/orders` — Execute atomic checkout transaction.
- `GET /api/orders/my-orders` — User's historical orders.
- `GET /api/orders/:id` — Specific order invoice and tracking.

### Admin Operations (`role: ADMIN` required)
- `GET /api/admin/metrics` — Gross revenue, total orders, active SKUs, customer count, low-stock alerts.
- `GET /api/admin/products` — Comprehensive SKU list including inactive items.
- `POST /api/admin/products` — Create new SKU.
- `PUT /api/admin/products/:id` — Update SKU details, price, or stock.
- `DELETE /api/admin/products/:id` — Safe deletion (archives if referenced in orders).
- `GET /api/admin/orders` — Storewide order list with search & status filters.
- `PATCH /api/admin/orders/:id/status` — Transition order fulfillment state.

---

## 11. Security & Architectural Safeguards

1. **Password Hashing**: Passwords are encrypted using `bcryptjs` with 10 salt rounds before database persistence.
2. **Role-Based Access Control (RBAC)**: Non-admin users are strictly rejected with `403 Forbidden` on `/api/admin/*` routes.
3. **HTTP-Only Cookies & Bearer Fallback**: Authentication tokens are transmitted in HTTP-only, SameSite cookies to protect against XSS, while allowing header authorization for API testing.
4. **Authoritative Price Validation**: Unit prices and line totals from the browser are disregarded during checkout; the server looks up database records.
5. **Rate Limiting**: `express-rate-limit` prevents brute-force login and spam attempts.
6. **HTTP Security Headers**: `helmet` enforces protective headers.
7. **SQL Injection Protection**: All queries are parameterized via Prisma ORM.

---

## 12. Testing & Quality Assurance

The codebase includes automated tests covering authentication, authorization, cart math, and checkout transactions:

```powershell
# Run backend API test suite
npm test

# Run frontend test suite
npm run test:client
```

---

## 13. Production Deployment Guide (Railway + PostgreSQL + Vercel)

### Architecture Overview
- **Backend API**: Node.js / Express hosted on [Railway](https://railway.app)
- **Production Database**: PostgreSQL 16 (Railway PostgreSQL or Supabase PostgreSQL)
- **Frontend SPA**: React 18 / Vite hosted on [Vercel](https://vercel.com)
- **Local Development**: Standalone SQLite (`prisma/dev.db`) preserved without changes

---

### A. Local Development with SQLite
Local development continues to use SQLite automatically.
```powershell
# 1. Install all dependencies (root, server, client)
npm run install:all

# 2. Generate local SQLite Prisma client (if needed)
npm run db:generate

# 3. Start full-stack local development (Express on :5000, Vite on :5173)
npm run dev
```

---

### B. Railway Project Setup (Backend)
1. Go to [Railway Dashboard](https://railway.app/dashboard) and create a **New Project**.
2. Select **Deploy from GitHub repo** and pick `CodeAlpha_Kivo_e-commerce`.
3. Railway automatically detects `nixpacks.toml` in the repository root.

---

### C. Database Provisioning (PostgreSQL 16)
You can use either Railway's built-in PostgreSQL or an existing Supabase PostgreSQL project:

- **Option 1: Supabase PostgreSQL (Existing)**
  1. Go to your Supabase Project Settings -> **Database** -> **Connection string**.
  2. Copy the URI connection string (Session Pooler or direct connection on port 5432).
  3. Ensure your password is URL-encoded if it contains special characters.

- **Option 2: Railway PostgreSQL**
  1. In your Railway project, click **+ New** -> **Database** -> **Add PostgreSQL**.
  2. Railway automatically provisions a PostgreSQL 16 database and creates a private connection variable `DATABASE_URL`.

---

### D. Railway Environment Variables
In your Railway backend service settings, navigate to the **Variables** tab and set:

| Variable | Recommended Production Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimisations and secure cookies |
| `PORT` | `5000` | Optional (Railway automatically assigns and injects `PORT`) |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL 16 connection string (Supabase or Railway) |
| `CLIENT_URL` | `https://<your-app>.vercel.app` | Vercel production domain (supports comma-separated URLs) |
| `JWT_SECRET` | `generate_random_32_char_secret` | Secure JWT signing key (minimum 32 characters) |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `COOKIE_SECURE` | `true` | Enforces HTTPS-only cookies for cross-domain auth |

---

### E. Running Prisma Production Migrations
*(One-Time Setup Command)*

Before or right after your first deployment, apply the PostgreSQL migrations to your database:

```powershell
# In project root:
# Set DATABASE_URL to your PostgreSQL 16 connection string
$env:DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Apply the initial migration safely (creates all tables, indexes, constraints)
npm run db:migrate:pg
```

> [!NOTE]
> `npm run db:migrate:pg` executes `npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma`. It is strictly additive, applies only pending migrations, and never drops or alters existing data.

#### Optional Initial Catalog Seeding:
If seeding a brand-new database with the default demo products and categories:
```powershell
node prisma/seed.js
```
*(The seed script is protected by safety guards; it will automatically abort and preserve records if data already exists.)*

---

### F. Deploying Express Backend on Railway
With `nixpacks.toml` in place, Railway builds and runs the backend automatically:
1. Railway executes:
   - `npm install --prefix server --omit=dev`
   - `npm install --prefix client --include=dev`
   - `npm install --omit=dev`
   - `npx prisma generate --schema=prisma/schema.postgresql.prisma`
   - `npm run build`
2. Railway starts the server with: `node server/src/server.js`

---

### G. Obtaining Railway Public Backend URL
1. In the Railway service view, go to **Settings** -> **Networking** -> **Public Networking**.
2. Click **Generate Domain** (e.g., `https://kivo-production-xxxx.up.railway.app`).
3. Note this domain — you will use it as `VITE_API_URL` on Vercel.

---

### H. Deploying React Frontend on Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New...** -> **Project**.
2. Import your GitHub repository (`CodeAlpha_Kivo_e-commerce`).
3. In Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` *(Important: click Edit and select the `client` folder)*
   - **Build Command**: `npm run build` (or `vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

---

### I. Setting VITE_API_URL and CLIENT_URL
1. In Vercel Project Settings -> **Environment Variables**, add:
   - Key: `VITE_API_URL`
   - Value: `https://<your-railway-backend-url>.up.railway.app/api`
   *(Both `https://.../api` and `https://...` are accepted; the client automatically normalizes the path).*
2. In Railway Service Settings -> **Variables**, update:
   - `CLIENT_URL`: `https://<your-vercel-domain>.vercel.app`
3. Redeploy frontend on Vercel and backend on Railway so the new variables take effect.

---

### J. Verifying the Live Application
1. **Health Check**: Open `https://<your-railway-backend>.up.railway.app/api/health` in your browser. Expected response:
   ```json
   {
     "status": "healthy",
     "brand": "Kivo E-Commerce",
     "database": "connected",
     "environment": "production"
   }
   ```
2. **Product Catalog**: Open `https://<your-vercel-app>.vercel.app`. Verify products load with correct pricing, categories, and images.
3. **Authentication**: Test login with demo customer or admin credentials. Verify JWT token and session cookies are set correctly.
4. **Cart & Checkout**: Add an item to the cart and verify demo checkout completes with order generation.

---

## 14. Known Limitations & Production Roadmap

- **Live Payment Gateway**: Production requires swapping the sandbox simulator for Stripe Elements or PayPal SDK with webhook signature validation.
- **Email Dispatch**: Currently logs simulation notices in development; production requires configuring SendGrid, Resend, or AWS SES.
- **Image Hosting**: Product images currently link to high-resolution Unsplash CDN URLs. Production should integrate Cloudinary or AWS S3 for direct merchant asset uploads.

---

*Engineered with precision for Kivo.*
