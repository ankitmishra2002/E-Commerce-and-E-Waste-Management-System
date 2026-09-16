# Backend Service

The `backend/` directory contains the API service for the ecommerce platform. It provides authentication, authorization, product and order management, vendor workflows, and media upload handling.

## Purpose

- Deliver a stable REST API for the frontend and external clients.
- Keep request handling minimal in controllers and centralize business rules in `services/`.
- Enforce validation, role-based security, and consistent response formatting.

## Key Capabilities

- Product, cart, order, review, complaint, user, and vendor management endpoints
- JWT-based authentication with refresh token support
- Role-based route protection for customers, vendors, and administrators
- Request validation with Zod
- Cloudinary integration for image uploads
- Drizzle ORM schema definitions and database utilities

## Technology Stack

- Node.js 18+ recommended
- Express 5
- Drizzle ORM with PostgreSQL-compatible databases
- Cloudinary for media hosting
- JSON Web Tokens for authentication
- Zod for input validation

## Project Layout

- `app.js` / `server.js` — application bootstrap and server startup
- `config/` — database and Cloudinary configuration
- `controllers/` — HTTP request handlers
- `services/` — core business logic and data operations
- `routes/` — API route definitions
- `middleware/` — authentication, authorization, validation, and upload handling
- `models/schema.js` — Drizzle ORM schema definitions
- `utils/` — reusable helpers and response formatters
- `uploads/` — temporary upload artifacts

## Getting Started

1. Install dependencies:

   ```powershell
   cd project/backend
   npm install
   ```

2. Create the environment file:

   ```powershell
   cp .env.example .env
   ```

3. Update `.env` with database, JWT, Cloudinary, and client settings.

4. Run the application in development:

   ```powershell
   npm run dev
   ```

## Useful Scripts

- `npm run dev` — start the backend with automatic restarts
- `npm start` — run the backend in production mode
- `npm run seed` — populate the database with demo data
- `npm run db:generate` — generate Drizzle schema or migrations
- `npm run db:push` — push schema changes to the database
- `npm run db:studio` — open Drizzle Studio

## Environment Variables (summary)

- `PORT` — server port
- `NODE_ENV` — application environment
- `DATABASE_URL` — database connection string
- `JWT_SECRET` — access token secret
- `JWT_EXPIRES_IN` — access token lifespan
- `REFRESH_TOKEN_SECRET` — refresh token secret
- `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name
- `CLOUDINARY_API_KEY` — Cloudinary API key
- `CLOUDINARY_API_SECRET` — Cloudinary API secret
- `CLIENT_URL` — allowed frontend origin for CORS

## Best Practices

- Keep secrets outside of source control and use `.env` files only in local development.
- Use strong, unique JWT secrets and refresh token values.
- Enable HTTPS and secure headers in production.
- Keep the backend stateless so it can scale behind a load balancer.
- Use CI to validate code and run linting before merging.

## Extensions

This backend can be extended with:

- payment gateway integration (Stripe, Razorpay, etc.)
- email notifications and transactional workflows
- audit logging and analytics endpoints
- caching with Redis or in-memory stores
- additional admin dashboards and reporting
