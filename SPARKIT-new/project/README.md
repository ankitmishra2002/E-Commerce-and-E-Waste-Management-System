# ⚡ SparkIT
### Next-Gen E-commerce and E-waste Management System

<p align="center">
  <img src="C:\Users\ankit\Downloads\SPARKIT-new\SPARKIT-new\SPARKIT.png" alt="SparkIT Logo" width="120" style="border-radius: 20%; box-shadow: 0px 4px 10px rgba(0,0,0,0.15);" />
</p>

<p align="center">
  <b>Empowering circular economy through retail e-commerce and certified green e-waste collection.</b>
</p>

<p align="center">
  <a href="#overview">Overview</a> · 
  <a href="#features">Features</a> · 
  <a href="#architecture--technology-stack">Architecture</a> · 
  <a href="#screenshots">Screenshots</a> · 
  <a href="#repository-structure">Repository Structure</a> · 
  <a href="#getting-started">Getting Started</a> · 
  <a href="#environment-variables">Environment Variables</a> · 
  <a href="#seeded-test-accounts">Test Accounts</a> · 
  <a href="#documentation">Documentation</a>
</p>

<p align="center">
  <!-- Frontend Badges -->
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Zustand-orange?style=for-the-badge" alt="Zustand" />
  <img src="https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white" alt="React Query" />
</p>

<p align="center">
  <!-- Backend Badges -->
  <img src="https://img.shields.io/badge/Express_v5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express v5" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Neon_DB-00E599?style=for-the-badge&logo=neon&logoColor=black" alt="Neon Database" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/Redis_Upstash-FD4D2D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis Cache" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
</p>

---

## Overview

**SparkIT** is a full-stack, enterprise-grade marketplace designed to solve the growing environmental challenge of electronic waste (E-Waste) while delivering a premium, modern retail E-Commerce shopping experience.

By bridging traditional retail shopping with localized, verified E-Waste recycling channels, SparkIT enables customers to purchase electronics and recycle old hardware for cashback rewards, vendors to manage catalogs and bid on recycling pickups, and administrators to oversee platform compliance.

The codebase is structured as a monorepo with two independently deployable services:

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4 | SPA with role-based portals (Customer, Vendor, Admin), E-Waste recycling console, real-time WebSocket notifications, responsive charts, and glassmorphic UI |
| **Backend** | Node.js 18+, Express 5, Neon DB | Scalable REST API & WebSockets server handling JWT auth, role RBAC, Drizzle ORM PostgreSQL mapping, Redis caching, and Cloudinary media pipelines |

---

## Features

### 👤 Customer Experience & Retail Store
- **Product Catalog & Search**: Advanced multi-attribute search, category hierarchy navigation, price-range filtering, and real-time stock indicators.
- **Interactive Cart & Wishlist**: Persistent client-side state powered by Zustand with optimistic state mutations and local storage fallbacks.
- **Order Tracking Timeline**: Step-by-step order journey (`Pending` ➔ `Confirmed` ➔ `Processing` ➔ `Shipped` ➔ `Delivered`) with real-time WebSocket status updates.
- **Payment Options**: Integrated checkout workflows supporting Cash on Delivery (COD) and online gateway processing (Razorpay).

### ♻️ E-Waste Recycling Lifecycle
- **Pickup Request Wizard**: Multi-file inspection photo upload, appliance categorization, condition grading, and pickup address assignment.
- **Vendor Bidding & Quote Engine**: Certified recycling vendors inspect submitted tickets, submit verified condition quotes, and claim pickup assignments.
- **Admin Verification & Payout**: Centralized compliance desk for verifying trade values, releasing cashback rewards, and auditing recycling completions.
- **Vendor Rating & Review**: Peer reviews and 5-star ratings for verified recyclers after pickup completion.

### 🏪 Vendor Operations & Analytics
- **Inventory Control Hub**: Full CRUD suite for product listings, stock level toggles, price updates, and multi-image uploads.
- **Recycling Ticket Board**: Interactive board for claiming user-submitted e-waste, providing custom quotes, and tracking pickup logistics.
- **Sales Analytics & Insights**: Interactive revenue line charts (Recharts), low-stock warning triggers, and payout transaction logs.

### 🛡️ Platform Security & Governance
- **JWT Auth with Silent Rotation**: Short-lived access tokens paired with refresh tokens; Axios client interceptors handle seamless rotation.
- **Role-Based Access Control (RBAC)**: Strict route guards for Customer (`USER`), Recycle Vendor (`VENDOR`), and Platform Administrator (`ADMIN`).
- **Rate Limiting & Hardening**: `express-rate-limit`, `helmet` HTTP security headers, Gzip compression, and strict `zod` schema input validation.

---

## Architecture & Technology Stack

```
                  ┌──────────────────────────────────────────────┐
                  │                 Vite Client                  │
                  │ (React 19, Tailwind v4, Zustand, React Query)│
                  └──────────────────────┬───────────────────────┘
                                         │  HTTP / WebSockets
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │             Node/Express Server              │
                  │     (Zod Validation, Custom Middleware)      │
                  └──────┬───────────────┬────────────────┬──────┘
                         │ Drizzle ORM   │ HTTP           │ Upstash SDK
                         ▼               ▼                ▼
                 ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
                 │   Neon DB    │ │  Cloudinary  │ │ Upstash Redis│
                 │ (PostgreSQL) │ │ (Media API)  │ │ (Cache Tier) │
                 └──────────────┘ └──────────────┘ └──────────────┘
```

### Layered Technology Matrix

| Layer | Frontend | Backend |
| :--- | :--- | :--- |
| **Runtime / Framework** | React 19, Vite | Node.js 18+, Express 5 |
| **Database / ORM** | — | Neon PostgreSQL, Drizzle ORM |
| **Cache Tier** | — | Upstash Redis |
| **State Management** | Zustand, TanStack React Query | Ephemeral Redis Cache |
| **Real-Time Communication** | Socket.io Client | Socket.io Engine |
| **Styling & UI** | Tailwind CSS v4, Lucide React | — |
| **Data Visualization** | Recharts | — |
| **Form & Validation** | React Hook Form, Zod | Zod validation middleware |
| **HTTP / Auth Client** | Axios (with auto-refresh interceptors) | JWT (Access + Refresh), bcryptjs |
| **File & Media Handling** | FormData multi-upload | Multer, Cloudinary API |
| **Security** | Role Route Guards, Sanitized state | Helmet, CORS, express-rate-limit |

---

## 🔄 E-Waste Recycling Lifecycle Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Customer
    actor Vendor as 🏪 Recycle Vendor
    actor Admin as 🛡️ Platform Admin

    Customer->>Backend: Create E-Waste Pickup Request (Category, Brand, Photos, Address)
    Backend-->>Vendor: Emit Socket Event (New available pickup listed)
    
    Vendor->>Backend: Click "Accept Pickup" (Claim ownership of request)
    Backend-->>Customer: Status Updates to ACCEPTED
    
    Note over Vendor, Customer: Vendor arrives at Address & Inspects Hardware
    
    Vendor->>Backend: Submit Verified Condition + Quote Price
    Backend-->>Customer: Status Updates to QUOTE_PROVIDED (Socket ping)
    
    Customer->>Backend: Accept Quote Price
    Backend-->>Admin: Status Updates to QUOTE_ACCEPTED (Pending Admin Check)
    
    Admin->>Backend: Verify transaction details & Approve Transaction
    Backend-->>Vendor: Status Updates to APPROVED
    
    Vendor->>Backend: Confirm Collection & Disburse Payment (COD/Online)
    Backend-->>Customer: Status Updates to COMPLETED / PAID
    
    Customer->>Backend: Leave Review & Star Rating (1 to 5) for Vendor
    Note over Customer, Admin: Admin dashboard updates vendor rating scorecard
```

---

## 🗄️ Database Schema & ERD

SparkIT features a fully-relational schema with **17 tables** linked together through strict foreign key constraints defined in Drizzle ORM.

```mermaid
erDiagram
    users ||--o| vendor_profiles : "has profile"
    users ||--o{ products : "manages"
    users ||--o{ carts : "owns"
    users ||--o{ wishlists : "saves"
    users ||--o{ addresses : "registers"
    users ||--o{ orders : "places"
    users ||--o{ returns : "requests"
    users ||--o{ reviews : "writes"
    users ||--o{ complaints : "files"
    users ||--o{ notifications : "receives"
    users ||--o{ ewaste_requests : "submits user"
    users ||--o{ ewaste_requests : "handles vendor"
    
    categories ||--o{ categories : "parent category"
    categories ||--o{ products : "contains"
    
    products ||--o{ product_media : "has images"
    products ||--o{ cart_items : "added to"
    products ||--o{ wishlists : "pinned in"
    products ||--o{ order_items : "sold in"
    products ||--o{ reviews : "evaluated by"
    products ||--o{ complaints : "subject of"
    
    carts ||--o{ cart_items : "stores"
    
    orders ||--o{ order_items : "contains"
    orders ||--o{ returns : "associated returns"
    orders ||--o{ tracking_events : "tracks location"
    orders ||--o{ complaints : "references"
    
    addresses ||--o{ orders : "shipping target"
    addresses ||--o{ ewaste_requests : "pickup location"
    
    order_items ||--o{ returns : "returned items"
```

---

## Screenshots

### 1. 🌐 Customer Landing Page & Storefront
The Customer Landing Page features a modern, glassmorphic card layout showcasing platform metrics, primary call-to-actions, and quick catalog filters.
![Customer Landing Page](images/screenshots/homepage.png)

### 2. ♻️ E-Waste Recycling Hub
The E-Waste Recycle Hub allows users to log and track recycling pickup requests, displaying quoted prices, item age, and status steps.
![E-Waste Recycling Hub](images/screenshots/ewaste_hub.png)

### 3. 🛡️ Administrative Command Center
The Admin Dashboard provides real-time GMV metrics, registered user metrics, active vendor verification requests, and open complaint tickets.
![Admin Command Center](images/screenshots/admin_dashboard.png)

### 4. 🏪 Vendor Hub & Analytics
The Vendor Hub displays detailed analytics tracking total earnings, orders processed, revenue trendlines, and low-stock alerts.
![Vendor Hub & Analytics](images/screenshots/vendor_dashboard.png)

---

## Repository Structure

```
SPARKIT-new/
└── project/
    ├── README.md
    ├── .gitignore
    ├── backend/
    │   ├── config/             # Database connection, Redis & Cloudinary configs
    │   ├── controllers/        # Route controllers carrying endpoint logic
    │   ├── drizzle/            # Database schema migration history files
    │   ├── middleware/         # Auth verification, rate limiting, and uploads
    │   ├── models/             # Schema definitions and relational mappings
    │   ├── routes/             # Express routes mapped to controllers
    │   ├── services/           # Reusable service classes (auth, cache, cart)
    │   ├── sockets/            # WebSockets event listeners and publishers
    │   ├── utils/              # Global validators, handlers, and constants
    │   ├── app.js              # Express app configuration & middleware pipeline
    │   ├── seed.js             # Database seeding script for default accounts
    │   ├── server.js           # Server runner establishing HTTP & Socket ports
    │   ├── .env.example
    │   └── package.json
    └── frontend/
        ├── public/             # Static icons, logos, and favicons
        └── src/
            ├── api/            # Base Axios configurations and interceptors
            ├── assets/         # Static images, hero banners, and vector assets
            ├── components/     # UI elements (Timelines, Navbars, Bells, Dropdowns)
            ├── hooks/          # React hooks (custom themes, notifications)
            ├── pages/          # Layout views (Admin console, Vendor portal, User shop)
            ├── store/          # Zustand global store files (auth, cart, notifications)
            ├── utils/          # Formatting engines and utility functions
            ├── App.jsx         # App router wrapper defining routes
            └── main.jsx        # App mounting entry point
        ├── .env.sample
        └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18 or newer
- PostgreSQL database (Neon Serverless or local instance)
- Upstash Redis instance (or Redis server)
- Cloudinary account for media upload hosting

### 1. Clone the Repository
```bash
git clone https://github.com/ankitmishra2002/E-Commerce-and-E-Waste-Management-System.git
cd E-Commerce-and-E-Waste-Management-System/project
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Edit `backend/.env` with your Neon PostgreSQL URL, Upstash Redis token, and Cloudinary keys.

```bash
# Push database schema to Neon PostgreSQL
npm run db:push

# Seed database with default accounts & mock products
npm run seed

# Start development server
npm run dev
```
The API server starts on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.sample .env
```
Ensure `VITE_API_URL` is set to `http://localhost:5000`.

```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Local Express server port | `5000` |
| `NODE_ENV` | Application environment state | `development` |
| `DATABASE_URL` | Neon Serverless PostgreSQL connection URL | `postgresql://user:pass@ep-host.neon.tech/db` |
| `JWT_SECRET` | Secret key for access token signing | `your_access_token_secret` |
| `REFRESH_TOKEN_SECRET` | Secret key for refresh token signing | `your_refresh_token_secret` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis cluster REST URL | `https://your-redis.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST access token | `your_upstash_token` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary integration key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary secret key | `your_api_secret` |
| `CLIENT_URL` | Front-end web client URL (CORS allowed origin) | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Target backend REST API endpoint | `http://localhost:5000` |

---


## Documentation

| Document | Description |
| :--- | :--- |
| [backend/README.md](https://github.com/ankitmishra2002/E-Commerce-and-E-Waste-Management-System/blob/main/project/backend/README.md) | REST API endpoints, Drizzle ORM schemas, WebSocket events & backend notes |
| [frontend/README.md](https://github.com/ankitmishra2002/E-Commerce-and-E-Waste-Management-System/blob/main/project/frontend/README.md) | Component architecture, Zustand stores, React Query caching & client config |

---

<p align="center">
  SparkIT — Empowering a sustainable, circular tech future 💚
</p>