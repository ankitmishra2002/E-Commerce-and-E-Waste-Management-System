import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, ShoppingBag, Landmark, User } from 'lucide-react';
import axiosInstance from '../../api/axios.js';
import OrderTrackingTimeline from '../../components/common/OrderTrackingTimeline.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function OrderTracking() {
  const { orderId } = useParams();

  // Fetch tracking details using React Query
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['tracking', orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/tracking/${orderId}`);
      return res.data.data;
    },
    refetchInterval: 30000 // Poll every 30 seconds
  });

  // Fetch order summary details
  const { data: order = null, isLoading: isOrderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/orders/${orderId}`);
      return res.data.data;
    }
  });

  if (isLoading || isOrderLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading tracking timeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center space-y-4 text-center">
        <p className="text-sm text-red-500 font-semibold">Failed to fetch order tracking info.</p>
        <Link to="/orders" className="text-xs font-bold text-brand-600 hover:underline">
          Return to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Back Header */}
      <div className="flex items-center space-x-2">
        <Link
          to={`/orders`}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors text-slate-600 dark:text-slate-300"
          title="Back to orders"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Order Tracker</span>
          <h1 className="heading-display text-xl font-bold text-slate-800 dark:text-slate-100">
            Track Order Details
          </h1>
        </div>
      </div>

      {/* Summary Card */}
      {order && (
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center">
              <ShoppingBag className="w-3 h-3 mr-1" />
              Order ID
            </span>
            <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{order.id}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Placed Date
            </span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center">
              <Landmark className="w-3 h-3 mr-1" />
              Total Amount
            </span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center">
              <User className="w-3 h-3 mr-1" />
              Payment Status
            </span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {order.paymentStatus}
            </p>
          </div>
        </div>
      )}

      {/* Timeline Card */}
      <div className="p-6 bg-slate-50 dark:bg-dark-950/30 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-inner space-y-6">
        <h2 className="heading-display text-base font-bold text-slate-800 dark:text-slate-200 border-b pb-3 dark:border-slate-800">
          Tracking Timeline Updates
        </h2>
        <OrderTrackingTimeline events={events} />
      </div>
    </div>
  );
}
