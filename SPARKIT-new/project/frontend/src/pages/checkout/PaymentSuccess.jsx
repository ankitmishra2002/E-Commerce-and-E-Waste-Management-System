import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Calendar, Landmark, MapPin } from 'lucide-react';
import axiosInstance from '../../api/axios.js';
import { formatCurrency } from '../../utils/formatters.js';
import toast from 'react-hot-toast';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      try {
        const res = await axiosInstance.get(`/orders/${orderId}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error('Failed to load order details', err);
        toast.error('Could not load confirmed order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fetching order confirmation details...</p>
      </div>
    );
  }

  // Calculate delivery date (placed date + estimated 5 days)
  const getDeliveryDateString = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-center animate-fade-in">
      {/* Success Badge */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-green-100 dark:bg-green-950/20 rounded-full scale-150 animate-ping opacity-75"></div>
          <CheckCircle className="w-20 h-20 text-green-500 relative z-10" />
        </div>
        <h1 className="heading-display text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Order Placed Successfully!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Thank you for your purchase. We have received your order and are processing it.
        </p>
      </div>

      {order && (
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-left shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b gap-4">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Order ID</span>
              <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{order.id}</p>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Total Amount Paid</span>
              <p className="text-base font-extrabold text-brand-600 dark:text-brand-400">{formatCurrency(order.totalAmount)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Info */}
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Estimated Delivery</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {getDeliveryDateString(order.createdAt)}
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="flex items-start space-x-3">
              <Landmark className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Payment Method</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {order.paymentMethod === 'COD' ? 'Cash On Delivery' : 'Simulated Checkout'}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            {order.address && (
              <div className="flex items-start space-x-3 md:col-span-2">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Shipping To</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {order.address.line1}, {order.address.line2 && `${order.address.line2}, `}
                    {order.address.city}, {order.address.state} — {order.address.pincode}, {order.address.country}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
        <Link
          to="/orders"
          className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md flex justify-center items-center space-x-2 transition-colors cursor-pointer"
        >
          <Package className="w-4 h-4" />
          <span>View My Orders</span>
        </Link>
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl flex justify-center items-center space-x-2 transition-colors cursor-pointer"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
