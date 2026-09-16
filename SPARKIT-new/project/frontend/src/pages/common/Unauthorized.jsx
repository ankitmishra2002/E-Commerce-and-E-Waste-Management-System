import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ShieldAlert className="w-20 h-20 text-red-500 mb-6 animate-pulse" />
      <h1 className="heading-display text-4xl font-bold mb-3">Access Denied</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        You do not have the required permissions to view this page. If you believe this is an error, please check with an administrator.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-md transition-colors"
      >
        Go back home
      </Link>
    </div>
  );
}
