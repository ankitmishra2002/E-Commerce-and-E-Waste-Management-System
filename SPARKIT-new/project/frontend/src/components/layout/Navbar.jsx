import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';
import { useTheme } from '../../hooks/useTheme.js';
import { ShoppingCart, Heart, User, Sun, Moon, LogOut, LayoutDashboard, Shield, Menu, X, Recycle } from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationBell from '../common/NotificationBell.jsx';
import axiosInstance from '../../api/axios.js';

export default function Navbar() {
  const { user, logout, isAuthenticated, role } = useAuthStore();
  const { cartCount } = useCartStore();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic nav label for the home/shop link based on role
  const shopLinkLabel = role === 'VENDOR'
    ? 'Marketplace'
    : role === 'ADMIN'
    ? 'Platform Overview'
    : 'Shop';

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout failed, clearing local state anyway', err);
    } finally {
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
      setMobileMenuOpen(false);
    }
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMobile}>
              <span className="heading-display text-2xl font-bold bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-600">
                SparkIT
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-slate-600 dark:text-slate-300"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* General links */}
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400"
            >
              {shopLinkLabel}
            </Link>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <NotificationBell />

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="p-2 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-slate-600 dark:text-slate-300 relative"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="p-2 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-slate-600 dark:text-slate-300 relative"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Role Specific Dashboards */}
                {role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/50"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {role === 'VENDOR' && (
                  <Link
                    to="/vendor/dashboard"
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900/50 hover:bg-brand-100 dark:hover:bg-brand-900/50"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Vendor Hub</span>
                  </Link>
                )}

                {role === 'USER' && (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/ewaste"
                      className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-650 dark:hover:text-brand-400"
                    >
                      E-Waste Recycle
                    </Link>
                    <Link
                      to="/vendor/register"
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                    >
                      Sell on SparkIT
                    </Link>
                  </div>
                )}

                {/* Profile */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-1.5 p-1 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-slate-700 dark:text-slate-300"
                  title="Profile"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL.replace('/api', '')}${user.avatar}`}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-300 text-xs font-bold border border-brand-200 dark:border-brand-800">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="hidden lg:inline text-sm font-medium truncate max-w-[100px]">
                    {user?.name}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Quick icons + Hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Theme toggle - always visible */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-slate-600 dark:text-slate-300"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications - mobile quick access */}
            {isAuthenticated && <NotificationBell />}

            {/* Cart icon with badge - quick access on mobile */}
            {isAuthenticated && (
              <Link
                to="/cart"
                className="p-2 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-slate-600 dark:text-slate-300 relative"
                onClick={closeMobile}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-slate-600 dark:text-slate-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-2 space-y-2 border-t border-slate-200 dark:border-slate-800 glass">
          <Link
            to="/"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              closeMobile();
            }}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-dark-100 dark:hover:bg-dark-800"
          >
            {shopLinkLabel}
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/wishlist"
                onClick={closeMobile}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-dark-100 dark:hover:bg-dark-800"
              >
                <Heart className="w-5 h-5" />
                <span>Wishlist</span>
              </Link>

              <Link
                to="/orders"
                onClick={closeMobile}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-dark-100 dark:hover:bg-dark-800"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>My Orders</span>
              </Link>

              <Link
                to="/profile"
                onClick={closeMobile}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-dark-100 dark:hover:bg-dark-800"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>

              {role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  onClick={closeMobile}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {role === 'VENDOR' && (
                <Link
                  to="/vendor/dashboard"
                  onClick={closeMobile}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Vendor Hub</span>
                </Link>
              )}

              {role === 'USER' && (
                <div className="space-y-1">
                  <Link
                    to="/ewaste"
                    onClick={closeMobile}
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-dark-100 dark:hover:bg-dark-800"
                  >
                    <Recycle className="w-5 h-5 text-slate-500" />
                    <span>E-Waste Recycle</span>
                  </Link>
                  <Link
                    to="/vendor/register"
                    onClick={closeMobile}
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Sell on SparkIT</span>
                  </Link>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMobile}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-dark-100 dark:hover:bg-dark-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={closeMobile}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-center bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
