import React, { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout components — always needed, eagerly loaded
import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import RoleRoute from './components/layout/RoleRoute.jsx';
import PageLoader from './components/common/PageLoader.jsx';

// State hydration — always needed
import { useCartStore } from './store/cartStore.js';
import { useAuthStore } from './store/authStore.js';

// ─── Lazy-loaded page chunks ─────────────────────────────────────────────────
// Each lazy() call creates a separate JS chunk downloaded only when first visited.
// This drops the initial bundle from ~1027 KB to ~150-200 KB.

// Auth pages (rarely visited after signup)
const Login          = lazy(() => import('./pages/auth/Login.jsx'));
const Register       = lazy(() => import('./pages/auth/Register.jsx'));
const VendorLogin    = lazy(() => import('./pages/auth/VendorLogin.jsx'));
const VendorRegister = lazy(() => import('./pages/auth/VendorRegister.jsx'));

// Customer pages — high-traffic, loaded quickly after initial visit
const Home           = lazy(() => import('./pages/customer/Home.jsx'));
const ProductDetails = lazy(() => import('./pages/customer/ProductDetails.jsx'));
const Cart           = lazy(() => import('./pages/customer/Cart.jsx'));
const Wishlist       = lazy(() => import('./pages/customer/Wishlist.jsx'));
const Checkout       = lazy(() => import('./pages/customer/Checkout.jsx'));
const Orders         = lazy(() => import('./pages/customer/Orders.jsx'));
const Profile        = lazy(() => import('./pages/customer/Profile.jsx'));
const PaymentSuccess = lazy(() => import('./pages/checkout/PaymentSuccess.jsx'));
const OrderTracking  = lazy(() => import('./pages/user/OrderTracking.jsx'));

// E-Waste pages
const EwasteRequests = lazy(() => import('./pages/customer/EwasteRequests.jsx'));
const EwasteCreate   = lazy(() => import('./pages/customer/EwasteCreate.jsx'));
const EwasteDetail   = lazy(() => import('./pages/customer/EwasteDetail.jsx'));

// Vendor pages — completely isolated; recharts only downloads for vendors
const VendorDashboard  = lazy(() => import('./pages/vendor/VendorDashboard.jsx'));
const VendorProducts   = lazy(() => import('./pages/vendor/VendorProducts.jsx'));
const VendorComplaints = lazy(() => import('./pages/vendor/VendorComplaints.jsx'));

// Admin pages — isolated; only downloaded by admins
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminVendors    = lazy(() => import('./pages/admin/AdminVendors.jsx'));
const AdminUsers      = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminComplaints = lazy(() => import('./pages/admin/AdminComplaints.jsx'));

// Admin E-Waste page
const AdminEwaste = lazy(() => import('./pages/admin/AdminEwaste.jsx'));

// Vendor E-Waste pages
const VendorEwaste        = lazy(() => import('./pages/vendor/VendorEwaste.jsx'));
const VendorEwasteInspect = lazy(() => import('./pages/vendor/VendorEwasteInspect.jsx'));

// Common fallback pages — tiny, but still lazy to keep initial bundle lean
const Unauthorized = lazy(() => import('./pages/common/Unauthorized.jsx'));
const NotFound     = lazy(() => import('./pages/common/NotFound.jsx'));

// ─── QueryClient — with sensible caching ─────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch just because the user switched tabs
      refetchOnWindowFocus: false,
      // Retry once before showing an error
      retry: 1,
      // Data stays "fresh" for 60 seconds — prevents re-fetching on
      // every navigation to the same page (e.g. going back to Home)
      staleTime: 60_000,
      // Keep unused data in cache for 5 minutes before GC
      gcTime: 5 * 60_000,
    }
  }
});

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const { isAuthenticated, role } = useAuthStore();
  const fetchCart = useCartStore((state) => state.fetchCart);

  // Re-hydrate cart on boot if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && role === 'USER') {
      fetchCart();
    }
  }, [isAuthenticated, role]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout>
          {/*
            Suspense wraps all routes — when a lazy chunk is being downloaded
            (first visit to a route), PageLoader is shown as the fallback.
            Subsequent visits use the already-downloaded cached chunk instantly.
          */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Public Routes ────────────────────────────────────────── */}
              <Route
                path="/"
                element={
                  role === 'VENDOR' ? <Navigate to="/vendor/dashboard" replace /> :
                  role === 'ADMIN'  ? <Navigate to="/admin/dashboard" replace /> :
                  <Home />
                }
              />
              <Route path="/product/:id" element={<ProductDetails />} />

              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
              />
              <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
              />
              <Route
                path="/vendor/login"
                element={role === 'VENDOR' ? <Navigate to="/vendor/dashboard" replace /> : <VendorLogin />}
              />
              <Route
                path="/vendor/register"
                element={role === 'VENDOR' ? <Navigate to="/vendor/dashboard" replace /> : <VendorRegister />}
              />

              {/* ── Protected Customer Routes ─────────────────────────── */}
              <Route path="/cart"     element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route
                path="/payment-success"
                element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>}
              />
              <Route
                path="/user/orders/:orderId/tracking"
                element={<ProtectedRoute><OrderTracking /></ProtectedRoute>}
              />

              {/* E-Waste Customer Routes */}
              <Route path="/ewaste"     element={<ProtectedRoute><EwasteRequests /></ProtectedRoute>} />
              <Route path="/ewaste/new" element={<ProtectedRoute><EwasteCreate /></ProtectedRoute>} />
              <Route path="/ewaste/:id" element={<ProtectedRoute><EwasteDetail /></ProtectedRoute>} />

              {/* ── Protected Vendor Routes ───────────────────────────── */}
              <Route
                path="/vendor"
                element={<RoleRoute allowedRoles={['VENDOR']}><Navigate to="/vendor/dashboard" replace /></RoleRoute>}
              />
              <Route
                path="/vendor/dashboard"
                element={<RoleRoute allowedRoles={['VENDOR']}><VendorDashboard /></RoleRoute>}
              />
              <Route
                path="/vendor/products"
                element={<RoleRoute allowedRoles={['VENDOR']}><VendorProducts /></RoleRoute>}
              />
              <Route
                path="/vendor/complaints"
                element={<RoleRoute allowedRoles={['VENDOR']}><VendorComplaints /></RoleRoute>}
              />

              {/* Vendor E-Waste Routes */}
              <Route
                path="/vendor/ewaste"
                element={<RoleRoute allowedRoles={['VENDOR']}><VendorEwaste /></RoleRoute>}
              />
              <Route
                path="/vendor/ewaste/:id"
                element={<RoleRoute allowedRoles={['VENDOR']}><VendorEwasteInspect /></RoleRoute>}
              />

              {/* ── Protected Admin Routes ────────────────────────────── */}
              <Route
                path="/admin"
                element={<RoleRoute allowedRoles={['ADMIN']}><Navigate to="/admin/dashboard" replace /></RoleRoute>}
              />
              <Route
                path="/admin/dashboard"
                element={<RoleRoute allowedRoles={['ADMIN']}><AdminDashboard /></RoleRoute>}
              />
              <Route
                path="/admin/vendors"
                element={<RoleRoute allowedRoles={['ADMIN']}><AdminVendors /></RoleRoute>}
              />
              <Route
                path="/admin/users"
                element={<RoleRoute allowedRoles={['ADMIN']}><AdminUsers /></RoleRoute>}
              />
              <Route
                path="/admin/complaints"
                element={<RoleRoute allowedRoles={['ADMIN']}><AdminComplaints /></RoleRoute>}
              />

              {/* Admin E-Waste Route */}
              <Route
                path="/admin/ewaste"
                element={<RoleRoute allowedRoles={['ADMIN']}><AdminEwaste /></RoleRoute>}
              />

              {/* ── Common Fallbacks ──────────────────────────────────── */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*"             element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
