# ⚡ SparkIT — Next-Gen E-Commerce & E-Waste Management System

<p align="center">
  <img src="../oldIphone.png" alt="SparkIT Logo" width="120" style="border-radius: 20%; box-shadow: 0px 4px 10px rgba(0,0,0,0.15);" />
</p>

<h3 align="center">Empowering circular economy through retail e-commerce and certified green e-waste collection.</h3>

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

## 📖 Introduction

**SparkIT** is a full-stack, enterprise-grade application designed to solve the growing environmental challenge of electronic waste (E-Waste) while delivering a premium, modern retail E-Commerce marketplace.

By bridging traditional retail shopping with localized, verified E-Waste recycling channels, SparkIT enables:
1. **Users** to purchase premium electronics and recycle their old hardware for cashback.
2. **Vendors** to list products for sale and bid/inspect user-submitted E-Waste recycling pickups.
3. **Administrators** to oversee trade compliance, verify vendors, and monitor general performance metrics.

---

## 🛠️ Architecture & Core Technologies

SparkIT is built using a state-of-the-art tech stack selected for maximum performance, real-time sync, and rapid development.

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

### Frontend Stack
* **Vite + React 19**: Ultra-fast hot module replacement, client-side rendering, and React 19 hooks.
* **Tailwind CSS v4**: Dynamic utility-first styling with the redesigned CSS-based config.
* **Zustand**: Lightweight, lightning-fast global state store.
* **TanStack React Query**: Server-state synchronization, query caching, and optimistic mutations.
* **Socket.io Client**: Dedicated real-time notification socket listener.
* **Recharts**: Responsive charting widgets for sales metrics and performance monitoring.
* **React Hook Form + Zod**: Declarative form layout, parsing, and type-safe schema checks.

### Backend Stack
* **Express.js (v5)**: Multi-route API server optimized for JSON payload handling.
* **Drizzle ORM + Drizzle Kit**: TypeScript-first, lightweight ORM managing PostgreSQL migrations and relationship mapping.
* **Neon PostgreSQL**: Serverless PostgreSQL database with branch-based scale-out.
* **Upstash Redis**: Ephemeral data caching for reduced database load.
* **Socket.io**: WebSockets provider powering immediate user, vendor, and admin notification updates.
* **Razorpay Gateway**: Integrated checkouts and payment processing.
* **Cloudinary + Multer**: Automatic image hosting and file-upload pipelines.
* **Security & Performance**: Zod payloads, bcryptjs hashing, express-rate-limit protection, helmet HTTP security headers, and Gzip compression.

---

## 🗄️ Database Schema & ERD

SparkIT features a fully-relational schema with **17 tables** linked together through strict foreign key constraints and relations defined in Drizzle.

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

    users {
        uuid id PK
        varchar name
        varchar email UK
        text password
        role_enum role "USER | VENDOR | ADMIN"
        text avatar
        boolean is_active
        timestamp created_at
    }

    vendor_profiles {
        uuid id PK
        uuid user_id FK
        varchar business_name
        text business_description
        varchar gst_number
        jsonb bank_account_info
        boolean is_verified
    }

    products {
        uuid id PK
        uuid vendor_id FK
        uuid category_id FK
        varchar name
        varchar slug UK
        text description
        numeric price
        integer stock
        boolean is_active
    }

    ewaste_requests {
        uuid id PK
        uuid user_id FK
        uuid address_id FK
        varchar category
        varchar brand
        text condition
        integer age
        jsonb images
        ewaste_status_enum status
        uuid vendor_id FK
        text verified_condition
        numeric quoted_price
        ewaste_approval_enum admin_approval_status
        varchar payment_status
        varchar payment_method
        integer rating
        text review
    }
```

---

## 🔄 E-Waste Recycling Lifecycle Flow

The green-earth E-Waste recycling system coordinates physical item checks, vendor quote bids, user confirmations, and platform verifications in a highly structured pipeline.

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

## 🌟 Core Features

### 👤 Customer Experience
* **Dynamic Search & Filters**: Search catalog items by keywords, categories, price range, and stock status.
* **Interactive Cart & Wishlist**: Optimistic state updates using Zustand with localized storage fallbacks.
* **Secure Payment Options**: Integrated checkout sequences supporting cash settlement and online gateways.
* **Order Tracking Timeline**: Real-time delivery status updates using step indicators (Pending ➔ Confirmed ➔ Processing ➔ Shipped ➔ Delivered).
* **E-Waste Recycle Console**: Interactive wizards for creating pickup requests with multi-file photo uploads.

### 🏪 Vendor Capabilities
* **Product Management Center**: Create, edit, toggle visibility, or soft-delete product catalog listings.
* **E-Waste Bid Board**: Browse open recycling tickets, view customer inspection photos, offer quotes, and complete trade deals.
* **Fulfillment Metrics**: Real-time sales records, inventory stock alerts, and delivery route assignments.
* **Business Profiles**: Setup and edit GST details, bank deposit routing info, and review performance ratings.

### 🛡️ Administrative Controls
* **Centralized E-Waste Monitor**: Oversee high-value transactions, verify trade compliance, and authorize final payout releases.
* **User & Vendor Auditor**: Enable or disable user login permissions and verify registered business documents.
* **Complaints Desk**: Read and resolve dispute tickets raised by customers against vendors or shipments.

---

## 🖥️ Application Previews & Screenshots

### 1. 🌐 Customer Landing Page & Storefront
The Customer Landing Page features a modern, clean, glassmorphic card layout with rich gradients, showcasing current platform status indicators ("Platform V2 Live"), primary call-to-actions ("Get Started", "Sign In"), and quick filters to search products by name or category.
![Customer Landing Page](images/screenshots/homepage.png)

### 2. ♻️ E-Waste Recycling Hub
The E-Waste Recycle Hub allows users to log and manage recycling requests. It shows a list of requests, such as a pickup request for an Apple Mobile with status indicators (e.g. "Collection Completed"), verified condition details, age, and quoted price.
![E-Waste Recycling Hub](images/screenshots/ewaste_hub.png)

### 3. 🛡️ Administrative Command Center
The Admin Dashboard provides real-time metrics summarizing the health of the SparkIT platform, showing GMV, registered user counts, active verified vendors, and open complaints, as well as lists for vendor verification and recent platform complaints.
![Admin Command Center](images/screenshots/admin_dashboard.png)

### 4. 🏪 Vendor Hub & Analytics
The Vendor Hub displays detailed analytics tracking total earnings, orders processed, and active product metrics. It includes an interactive line chart tracking the earnings timeline trend alongside low-stock alerts.
![Vendor Hub & Analytics](images/screenshots/vendor_dashboard.png)

---

## 📂 Project Directory Structure

```
SPARKIT-new/
└── project/
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
    │   └── server.js           # Server runner establishing HTTP & Socket ports
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
```

---

## ⚙️ Configuration & Environment Variables

Copy the example environments into your target paths:

### 📡 Backend Configuration
Create file [project/backend/.env](file:///C:/Users/ankit/Downloads/SPARKIT-new/SPARKIT-new/project/backend/.env):

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | Local Express Server Port | `5000` |
| `NODE_ENV` | Active Node runtime environment | `development` |
| `DATABASE_URL` | Neon Serverless PostgreSQL URL | `postgresql://user:pass@ep-host.region.neon.tech/db` |
| `JWT_SECRET` | Secret signature string for JWT access tokens | `your-high-security-jwt-secret-string` |
| `REFRESH_TOKEN_SECRET`| Secret signature string for JWT refresh tokens | `your-high-security-refresh-secret-string` |
| `UPSTASH_REDIS_REST_URL`| Redis cloud cluster URL | `https://your-instance.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN`| Redis cluster access token | `your-upstash-redis-rest-token` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Account Identifier Name | `dxyz1234` |
| `CLOUDINARY_API_KEY` | Cloudinary Integration Access Key | `987654321012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary Integration Secret | `your-cloudinary-secret-hash` |
| `CLIENT_URL` | Trusted React frontend origin | `http://localhost:5173` |

### 🖥️ Frontend Configuration
Create file [project/frontend/.env](file:///C:/Users/ankit/Downloads/SPARKIT-new/SPARKIT-new/project/frontend/.env):

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Target endpoint mapping to Express API | `http://localhost:5000` |

---

## 🚀 Quickstart & Setup Guide

### 📦 Setup Backend Service
1. Navigate into the backend root:
   ```powershell
   cd project/backend
   ```
2. Install project dependencies:
   ```powershell
   npm install
   ```
3. Prepare the environment variables file:
   ```powershell
   cp .env.example .env
   ```
   *(Update `.env` with your Neon PostgreSQL URL, Upstash Redis endpoints, and Cloudinary keys.)*
4. Run schema migrations to database:
   ```powershell
   npm run db:push
   ```
5. Seed initial roles, default catalog items, and mock orders:
   ```powershell
   npm run seed
   ```
6. Run the active service in development mode:
   ```powershell
   npm run dev
   ```

### 💻 Setup Frontend Interface
1. Open a new terminal session and navigate into the frontend folder:
   ```powershell
   cd project/frontend
   ```
2. Install npm package modules:
   ```powershell
   npm install
   ```
3. Create client environmental mapping:
   ```powershell
   cp .env.sample .env
   ```
4. Boot up the Vite client engine:
   ```powershell
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 🔐 Seeded Test Accounts

SparkIT includes a preset database seeding script. Use these default accounts to quickly test the multi-role E-Waste flow and retail experience:

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **👤 Customer** | `user1@sparkit.com` | `User@123` |
| **🏪 Recycle Vendor** | `vendor1@sparkit.com` | `Vendor@123` |
| **🛡️ Platform Admin** | `admin@sparkit.com` | `Admin@123` |

---

<p align="center">
  Made with 💚 to promote a sustainable, circular tech future.
</p>