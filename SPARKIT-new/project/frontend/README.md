# Frontend Application

The `frontend/` directory contains the React application for the ecommerce platform. It is implemented with Vite and Tailwind CSS and consumes the backend API for authenticated workflows.

## Highlights

- Role-based route protection for customers, vendors, and administrators
- Responsive interface built with Tailwind CSS
- API communication through a centralized Axios client
- Form handling with React Hook Form and validation using Zod
- Client state management with Zustand and React Query

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router DOM
- React Hook Form
- React Query
- Zod
- Axios
- Zustand

## Project Structure

- `src/main.jsx` — application entry point
- `src/App.jsx` — top-level router and layout wrapper
- `src/pages/` — page components grouped by role and feature
- `src/components/layout/` — shared layout and route guard components
- `src/api/axios.js` — configured Axios instance
- `src/store/` — client-side state stores
- `src/hooks/` — custom hooks such as notifications and theme management
- `src/utils/` — reusable utilities and presentation helpers

## Prerequisites

- Node.js 18 or later
- npm 10 or later
- Backend API available at the configured endpoint

## Installation

1. Install dependencies:

   ```powershell
   cd project/frontend
   npm install
   ```

2. Create and configure environment variables:

   ```powershell
   cp .env.sample .env
   # update VITE_API_URL if required
   ```

## Running Locally

- Start the development server:

  ```powershell
  npm run dev
  ```

- Build production assets:

  ```powershell
  npm run build
  ```

- Preview the production build:

  ```powershell
  npm run preview
  ```

- Run lint checks:

  ```powershell
  npm run lint
  ```

## Environment Variables

- `VITE_API_URL` — base API endpoint used by the frontend

## Best Practices

- Keep API configuration in `.env` for local and deployment environments
- Use linting to enforce code consistency
- Keep reusable UI and logic in shared components and utilities
- Maintain separate route guards for authenticated and role-based access
- Build production assets before deployment to ensure optimized performance

## Extending the Frontend

The application is structured to support additional ecommerce capabilities such as:

- search, filtering, and product sorting
- analytics and reporting dashboards
- real-time order status and notifications
- localization and multi-language support
- payment and checkout enhancements
