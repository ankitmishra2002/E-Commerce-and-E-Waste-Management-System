# ⚙️ SparkIT Backend Service
### Enterprise REST API, Real-Time WebSockets & Database Infrastructure

<p align="center">
  <a href="#overview">Overview</a> · 
  <a href="#core-capabilities">Capabilities</a> · 
  <a href="#architecture--tech-stack">Tech Stack</a> · 
  <a href="#directory-structure">Structure</a> · 
  <a href="#api-endpoint-reference">API Endpoints</a> · 
  <a href="#environment-variables">Environment Variables</a> · 
  <a href="#getting-started">Getting Started</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Express_v5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express v5" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Neon_DB-00E599?style=for-the-badge&logo=neon&logoColor=black" alt="Neon Database" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/Redis_Upstash-FD4D2D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis Cache" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
</p>

---

## Overview

The `backend/` service powers SparkIT’s multi-role E-Commerce marketplace and green E-Waste recycling network. Built on **Express 5** and **Node.js 18+**, it provides secure REST API endpoints, real-time WebSocket event dispatching via Socket.io, serverless PostgreSQL management with **Drizzle ORM**, and high-throughput caching using **Upstash Redis**.

---

## Core Capabilities

- **Multi-Role Authentication (JWT)**: Secure registration, login, and silent refresh token rotation backed by `bcryptjs` password hashing.
- **Role-Based Access Control (RBAC)**: Route middleware enforcing Customer (`USER`), Recycle Vendor (`VENDOR`), and Platform Administrator (`ADMIN`) permissions.
- **E-Waste Recycling Lifecycle Engine**: Bidding workflow supporting request generation, vendor inspection quotes, admin compliance verification, cash distribution, and vendor review scoring.
- **Real-Time WebSockets**: Instant updates for available e-waste pickup tickets, vendor quotes, order status progression, and administrative flags.
- **Media Upload Pipeline**: Multi-part file upload parsing with Multer, image transformation with Cloudinary, and secure CDN link storage.
- **Database Schema**: Type-safe relational mapping across **17 database tables** using Drizzle ORM on Neon Serverless PostgreSQL.

---

## Architecture & Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime & Server** | Node.js 18+, Express 5 | Asynchronous REST server & middleware pipeline |
| **Database** | Neon PostgreSQL | Serverless relational database hosting 17 tables |
| **ORM & Migrations** | Drizzle ORM, Drizzle Kit | Type-safe SQL schema definition, relations, and push migrations |
| **Caching Layer** | Upstash Redis | Ephemeral cache for catalog items & high-frequency reads |
| **Real-Time Engine** | Socket.io | WebSocket server broadcasting live state updates |
| **Authentication** | JWT (Access + Refresh), bcryptjs | Token-based auth with HTTP authorization headers |
| **Validation & Security** | Zod, Helmet, Rate Limiter | Declarative payload validation and HTTP header security |
| **Media Management** | Multer, Cloudinary API | Multi-part file upload processing and cloud image hosting |

---

## Directory Structure

```
backend/
├── config/
│   ├── db.js                 # Neon PostgreSQL connection via Drizzle ORM
│   ├── redis.js              # Upstash Redis REST client initialisation
│   └── cloudinary.js         # Cloudinary media SDK configuration
├── controllers/              # HTTP Request handlers carrying core endpoints logic
│   ├── authController.js     # User registration, login, refresh, logout
│   ├── productController.js  # Product catalog CRUD, search, vendor inventory
│   ├── orderController.js    # Order placement, shipping updates, payments
│   ├── ewasteController.js   # E-Waste pickup workflow, quotes, admin check, reviews
│   ├── vendorController.js   # Vendor profile data & fulfillment performance
│   ├── adminController.js    # Platform GMV metrics, vendor verification, complaints
│   └── userController.js     # User profile management & address book
├── drizzle/                  # Drizzle schema migrations & SQL snapshots
├── middleware/
│   ├── auth.js               # JWT verification & RBAC role protection
│   ├── validate.js           # Zod schema request validation
│   ├── upload.js             # Multer multipart form upload handler
│   └── errorHandler.js       # Centralized exception formatter
├── models/
│   ├── schema.js             # Drizzle ORM table definitions & enums
│   └── relations.js          # Relational mapping declarations across 17 tables
├── routes/                   # Express Router declarations
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   ├── ewasteRoutes.js
│   ├── vendorRoutes.js
│   ├── adminRoutes.js
│   └── userRoutes.js
├── services/                 # Reusable business logic & service abstractions
├── sockets/
│   └── socketHandler.js      # Socket.io connection manager & notification dispatchers
├── utils/
│   ├── response.js           # Standardized API response formatters
│   └── validators.js         # Zod validation schemas
├── app.js                    # Express app configuration & middleware stack
├── seed.js                   # Seeding script for test accounts & demo catalog
└── server.js                 # Application entry point binding HTTP & Socket ports
```

---

## API Endpoint Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new customer or vendor account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return access/refresh tokens |
| `POST` | `/api/auth/refresh` | Public | Rotate expired access token using refresh token |
| `POST` | `/api/auth/logout` | Authenticated | Revoke refresh token session |

### 🛍️ Products (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List products with pagination, category & search filters |
| `GET` | `/api/products/:id` | Public | Fetch product metadata & associated images |
| `POST` | `/api/products` | Vendor | Create new product listing with image upload |
| `PUT` | `/api/products/:id` | Vendor | Update product information or stock count |
| `DELETE` | `/api/products/:id` | Vendor/Admin | Archive or soft-delete product listing |

### ♻️ E-Waste Recycling (`/api/ewaste`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ewaste` | Customer | Submit e-waste recycling pickup ticket with photos |
| `GET` | `/api/ewaste/user` | Customer | View customer's submitted recycling tickets |
| `GET` | `/api/ewaste/vendor/available` | Vendor | View open e-waste tickets available for bidding |
| `PUT` | `/api/ewaste/:id/quote` | Vendor | Accept ticket & submit verified inspection quote |
| `PUT` | `/api/ewaste/:id/accept-quote` | Customer | Accept vendor's quote price |
| `PUT` | `/api/ewaste/:id/admin-approve` | Admin | Approve transaction compliance for payout release |
| `PUT` | `/api/ewaste/:id/complete` | Vendor | Confirm pickup completion & cash payout |
| `POST` | `/api/ewaste/:id/review` | Customer | Submit star rating and review for recycler |

### 📦 Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Customer | Place retail order with shipping address |
| `GET` | `/api/orders/my-orders` | Customer | Fetch order history with tracking progress |
| `PUT` | `/api/orders/:id/status` | Vendor/Admin | Advance order shipping status (`SHIPPED`, `DELIVERED`) |

### 🛡️ Admin & Vendor Management (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/metrics` | Admin | Fetch system-wide GMV, vendor, & transaction metrics |
| `PUT` | `/api/admin/verify-vendor/:id` | Admin | Approve or reject vendor business registration |

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Local Express Server Port | `5000` |
| `NODE_ENV` | Application Runtime Mode | `development` |
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@ep-host.neon.tech/db` |
| `JWT_SECRET` | Secret key for access token signing | `your_access_token_secret` |
| `REFRESH_TOKEN_SECRET`| Secret key for refresh token signing | `your_refresh_token_secret` |
| `UPSTASH_REDIS_REST_URL`| Upstash Redis REST URL | `https://your-instance.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN`| Upstash Redis REST token | `your_upstash_redis_token` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_api_secret` |
| `CLIENT_URL` | Front-end web client URL | `http://localhost:5173` |

---

## Getting Started

1. Navigate to the backend directory:
   ```bash
   cd project/backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Push database schema migrations to Neon PostgreSQL:
   ```bash
   npm run db:push
   ```
5. Seed database with test accounts & products:
   ```bash
   npm run seed
   ```
6. Launch development server:
   ```bash
   npm run dev
   ```
