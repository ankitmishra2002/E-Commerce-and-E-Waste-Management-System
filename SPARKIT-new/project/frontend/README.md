# 💻 SparkIT Frontend Application
### Next-Gen Single Page App with Role-Based Portals & Real-Time E-Commerce Engine

<p align="center">
  <a href="#overview">Overview</a> · 
  <a href="#core-features">Features</a> · 
  <a href="#technology-stack">Tech Stack</a> · 
  <a href="#project-structure">Structure</a> · 
  <a href="#state-management--architecture">Architecture</a> · 
  <a href="#environment-variables">Environment Variables</a> · 
  <a href="#getting-started">Getting Started</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Zustand-orange?style=for-the-badge" alt="Zustand" />
  <img src="https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white" alt="React Query" />
</p>

---

## Overview

The `frontend/` directory contains the modern React 19 single-page application (SPA) for **SparkIT**. Powered by Vite and styled with Tailwind CSS v4, it provides interactive storefronts, role-gated portals for Customers, Vendors, and Administrators, real-time WebSocket notification bells, and responsive analytics widgets.

---

## Core Features

- **Role-Based Protected Routing**: Declarative route guards restricting views to authenticated Customers, verified Vendors, or System Administrators.
- **Glassmorphic UI Design**: Modern Tailwind CSS v4 design system with smooth micro-animations, theme support, and responsive layouts.
- **State & Server Synchronization**: Lightweight global client state managed by Zustand combined with query caching & optimistic mutations via TanStack React Query.
- **Real-Time Notification Engine**: Socket.io listener integration powering toast alerts and notification dropdown updates for order updates and e-waste quotes.
- **Interactive Data Visualization**: Recharts integration powering vendor revenue trendlines, topic mix charts, and admin platform GMV monitors.
- **Type-Safe Form Management**: Form controls handled with React Hook Form paired with Zod schema validation.

---

## Technology Stack

| Layer | Library / Tool | Purpose |
| :--- | :--- | :--- |
| **Framework & Build** | React 19, Vite | Ultra-fast SPA framework with hot module replacement |
| **Styling & Icons** | Tailwind CSS v4, Lucide React | Utility-first glassmorphic styling and vector icons |
| **State Management** | Zustand | Global client state (Auth session, Cart, Notifications) |
| **Server State & Cache** | TanStack React Query | Data fetching, cache management, and query invalidation |
| **Routing** | React Router DOM | Declarative client routing and protected route wrappers |
| **Form & Validation** | React Hook Form, Zod | Form state management and schema parsing |
| **Data Visualization** | Recharts | Responsive charting for vendor and admin analytics |
| **Real-Time Sockets** | Socket.io Client | WebSocket connection listener for live alerts |
| **HTTP Client** | Axios | Configured API client with silent token rotation interceptors |

---

## Project Structure

```
frontend/
├── public/                     # Favicons and static assets
├── src/
│   ├── api/
│   │   └── axios.js            # Axios client with request/response auth interceptors
│   ├── assets/                 # Brand images, hero banners, and vector graphics
│   ├── components/             # Reusable UI modules
│   │   ├── common/             # Buttons, Modals, Badges, Loaders, Toasts
│   │   ├── layout/             # Header Navbar, Footer, Sidebar Navigation, Route Guards
│   │   ├── ewaste/             # Pickup request wizard, Quote cards, Inspection photo views
│   │   ├── products/           # Product cards, Filter bars, Rating stars, Review lists
│   │   └── vendor/             # Product forms, Sales charts, Ticket action drawers
│   ├── hooks/                  # Custom React hooks (useAuth, useNotifications, useTheme)
│   ├── pages/                  # Page level components
│   │   ├── admin/              # Admin Dashboard, Vendor Approvals, Complaints Monitor
│   │   ├── auth/               # Login, Signup, Forgot Password
│   │   ├── customer/           # Storefront, Product Detail, Cart, Checkout, Order Tracking
│   │   ├── ewaste/             # E-Waste Hub, Pickup Request Form, Quote Acceptance View
│   │   └── vendor/             # Vendor Dashboard, Product Catalog Management, E-Waste Bids
│   ├── store/
│   │   ├── useAuthStore.js     # Zustand store for user session & JWT state
│   │   ├── useCartStore.js     # Zustand store for shopping cart items & totals
│   │   └── useNotificationStore.js # Real-time notification array state
│   ├── utils/                  # Currency formatters, date formatters, and status mappers
│   ├── App.jsx                 # App router defining layout routes & RBAC guards
│   └── main.jsx                # Application mounting entry point
├── .env.sample                 # Reference environment variables
├── index.html                  # HTML template with Google Fonts integration
└── vite.config.js              # Vite build configuration
```

---

## State Management & Architecture

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      React Router                           │
 ├──────────────────────────────┬──────────────────────────────┤
 │   Public Routes              │   Protected Routes           │
 │   (/, /login, /products)     │   (Require Role Check)       │
 └──────────────┬───────────────┴──────────────┬───────────────┘
                │                              │
                ▼                              ▼
 ┌──────────────────────────────┐ ┌──────────────────────────────┐
 │       Zustand Stores         │ │     TanStack React Query     │
 │ (Auth, Cart, Notifications)  │ │ (Products, Orders, E-Waste)  │
 └──────────────┬───────────────┘ └──────────────┬───────────────┘
                │                                │
                └────────────────┬───────────────┘
                                 ▼
                     ┌──────────────────────┐
                     │ Axios Interceptor    │
                     │ (Bearer Access Token)│
                     └──────────┬───────────┘
                                ▼
                     ┌──────────────────────┐
                     │  Backend REST API    │
                     └──────────────────────┘
```

---

## Environment Variables

Copy `.env.sample` to `.env` in `project/frontend/`:

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base REST API URL of backend | `http://localhost:5000` |

---

## Getting Started

1. Navigate to the frontend directory:
   ```bash
   cd project/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.sample .env
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173` in your browser.
