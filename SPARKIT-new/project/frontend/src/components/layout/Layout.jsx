import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children }) {
  const { role } = useAuthStore();
  const location = useLocation();

  const isDashboardRoute = location.pathname.startsWith('/vendor') || location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-dark-800 dark:text-white border dark:border-slate-700 font-medium',
          duration: 3000,
        }}
      />

      <Navbar />

      <div className="flex-1 flex">
        {isDashboardRoute && <Sidebar role={role} />}

        <main className={`flex-1 min-w-0 ${isDashboardRoute ? 'p-3 sm:p-4 md:p-6 lg:p-8' : 'max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 w-full'}`}>
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {!isDashboardRoute && <Footer />}
    </div>
  );
}
