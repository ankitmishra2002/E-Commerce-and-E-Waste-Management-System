import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  AlertTriangle, 
  Users, 
  CheckSquare, 
  ArrowLeft,
  Menu,
  X,
  Recycle
} from 'lucide-react';

export default function Sidebar({ role }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isVendor = role === 'VENDOR';
  const isAdmin = role === 'ADMIN';

  // Dynamic label for the return-to-home link
  const returnLabel = isVendor
    ? 'Browse Marketplace'
    : isAdmin
    ? 'View Platform'
    : 'Return to Store';

  const vendorLinks = [
    { to: '/vendor/dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard },
    { to: '/vendor/products', label: 'My Products', icon: ShoppingBag },
    { to: '/vendor/complaints', label: 'Complaints Hub', icon: AlertTriangle },
    { to: '/vendor/ewaste', label: 'E-Waste Pickups', icon: Recycle },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/vendors', label: 'Vendor Verifications', icon: CheckSquare },
    { to: '/admin/users', label: 'User Operations', icon: Users },
    { to: '/admin/complaints', label: 'Platform Complaints', icon: AlertTriangle },
    { to: '/admin/ewaste', label: 'E-Waste Monitor', icon: Recycle },
  ];

  const links = isVendor ? vendorLinks : isAdmin ? adminLinks : [];

  const sidebarContent = (
    <div className="p-4 md:p-6 flex flex-col h-full justify-between">
      <div className="space-y-6">
        <div className="px-3">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {role} Panel
          </h2>
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-dark-100 dark:hover:bg-dark-800'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <NavLink
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-all"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          <span>{returnLabel}</span>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-4 left-4 z-40 bg-brand-600 text-white p-3 rounded-full shadow-lg hover:bg-brand-700 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] glass shadow-xl transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-end p-3">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-300"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="w-64 glass min-h-[calc(100vh-4rem)] border-r shadow-sm transition-all duration-200 hidden md:block shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
