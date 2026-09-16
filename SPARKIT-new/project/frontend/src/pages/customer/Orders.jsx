import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { ShoppingBag, Calendar, Truck, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, RefreshCcw } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // Complaint modal/form state
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintOrder, setComplaintOrder] = useState(null);
  const [complaintProduct, setComplaintProduct] = useState(null);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintBody, setComplaintBody] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Return request form state
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnOrderItem, setReturnOrderItem] = useState(null);
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/orders');
      setOrders(response.data.data?.orders || []);
    } catch (err) {
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await axiosInstance.put(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleOpenComplaint = (order, item) => {
    setComplaintOrder(order);
    setComplaintProduct(item.product);
    setComplaintSubject(`Issue with Order Item ${item.product.name}`);
    setComplaintBody(`Hello, I ordered ${item.product.name} on ${formatDate(order.createdAt)} and encountered the following issue:\n\n`);
    setShowComplaintForm(true);
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setSubmittingComplaint(true);
    try {
      const payload = {
        vendorId: complaintProduct.vendorId || complaintOrder.vendorId, // fallbacks
        productId: complaintProduct.id,
        orderId: complaintOrder.id,
        subject: complaintSubject,
        body: complaintBody
      };

      await axiosInstance.post('/complaints', payload);
      toast.success('Complaint filed successfully. The vendor/admin team has been notified.');
      setShowComplaintForm(false);
      
      // Clear forms
      setComplaintOrder(null);
      setComplaintProduct(null);
      setComplaintSubject('');
      setComplaintBody('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to file complaint');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleOpenReturn = (orderId, item) => {
    setReturnOrderId(orderId);
    setReturnOrderItem(item);
    setReturnReason('');
    setShowReturnForm(true);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    setSubmittingReturn(true);
    try {
      const payload = {
        orderItemId: returnOrderItem.id,
        reason: returnReason
      };

      await axiosInstance.post(`/orders/${returnOrderId}/return`, payload);
      toast.success('Return request filed successfully!');
      setShowReturnForm(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-warning-bg text-warning-text border-warning-text/20';
      case 'CONFIRMED': return 'bg-info-bg text-info-text border-info-text/20';
      case 'PROCESSING': return 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800/30';
      case 'SHIPPED': return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30';
      case 'DELIVERED': return 'bg-success-bg text-success-text border-success-text/20';
      case 'CANCELLED': return 'bg-danger-bg text-danger-text border-danger-text/20';
      default: return 'bg-slate-100 dark:bg-dark-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <ShoppingBag className="w-20 h-20 text-slate-300 dark:text-slate-700" />
        <div>
          <h2 className="heading-display text-2xl font-bold mb-1">No Orders Yet</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            You haven't placed any orders yet. Explore the shop and buy some items!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="heading-display text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 border-b pb-4">
        My Orders
      </h1>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const showCancelButton = order.status === 'PENDING';
          const itemsCount = order.items?.length || 0;

          return (
            <div
              key={order.id}
              className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              {/* Header summary of order */}
              <div
                onClick={() => toggleExpand(order.id)}
                className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-850 transition-colors"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 flex-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate w-[150px] sm:max-w-[120px] block" title={order.id}>{order.id}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order Date</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Amount</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{formatCurrency(order.totalAmount)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                  {showCancelButton && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }}
                      className="px-3 py-1.5 border border-red-200 text-red-650 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {/* Expandable Order Details */}
              {isExpanded && (
                <div className="p-5 border-t bg-slate-50/50 dark:bg-dark-900/50 space-y-5 animate-fade-in">
                  
                  {/* Address & Payment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-500 uppercase tracking-wider mb-1">Shipping Details</h4>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {order.address?.line1}, {order.address?.line2 && `${order.address.line2}, `}
                        {order.address?.city}, {order.address?.state} — {order.address?.pincode}, {order.address?.country}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Information</h4>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        Method: <span className="font-bold">{order.paymentMethod}</span> <br />
                        Status: <span className="font-bold text-brand-600 dark:text-brand-400">{order.paymentStatus}</span>
                      </p>
                    </div>
                    <div className="flex flex-col justify-center md:items-end">
                      <Link
                        to={`/user/orders/${order.id}/tracking`}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-colors cursor-pointer w-full md:w-auto"
                      >
                        <Truck className="w-3.5 h-3.5 mr-1" />
                        <span>Track Order</span>
                      </Link>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-1">Items ({itemsCount})</h4>
                    
                    {order.items?.map((item) => {
                      const product = item.product;
                      if (!product) return null;
                      
                      const primaryMedia = product.thumbnail || (product.media && product.media.length > 0
                        ? product.media[0].url
                        : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100');

                      const canReturn = order.status === 'DELIVERED' && !item.returnStatus;
                      
                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b last:border-0 gap-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-dark-850 flex-shrink-0">
                              <img src={primaryMedia.startsWith('http') ? primaryMedia : `${import.meta.env.VITE_API_URL.replace('/api', '')}${primaryMedia}`} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">{product.name}</span>
                              <span className="text-[10px] text-slate-400">Quantity: {item.quantity} × {formatCurrency(item.price)}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
                            
                            {/* Return state */}
                            {item.returnStatus && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Return: {item.returnStatus}
                              </span>
                            )}

                            {/* Complaint button */}
                            <button
                              onClick={() => handleOpenComplaint(order, item)}
                              className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                              title="File a Complaint"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>

                            {/* Return action */}
                            {canReturn && (
                              <button
                                onClick={() => handleOpenReturn(order.id, item)}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded flex items-center transition-colors cursor-pointer"
                              >
                                <RefreshCcw className="w-3 h-3 mr-1" />
                                Return
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 1. Complaint Filing Modal/Overlay */}
      {showComplaintForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitComplaint}
            className="w-full max-w-lg bg-white dark:bg-dark-900 rounded-2xl border p-6 space-y-4 shadow-2xl animate-fade-in"
          >
            <div>
              <h3 className="heading-display text-lg font-bold">File a Complaint</h3>
              <p className="text-xs text-slate-400">Specify details about the issue with {complaintProduct?.name}. We will assign it directly to the vendor for resolution.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Subject</label>
                <input
                  type="text"
                  value={complaintSubject}
                  onChange={(e) => setComplaintSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border rounded-lg text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description of Issue</label>
                <textarea
                  value={complaintBody}
                  onChange={(e) => setComplaintBody(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border rounded-lg text-sm focus:outline-none resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowComplaintForm(false)}
                className="flex-1 py-2 border rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-dark-850"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingComplaint}
                className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm"
              >
                {submittingComplaint ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Return Request Modal/Overlay */}
      {showReturnForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitReturn}
            className="w-full max-w-md bg-white dark:bg-dark-900 rounded-2xl border p-6 space-y-4 shadow-2xl animate-fade-in"
          >
            <div>
              <h3 className="heading-display text-lg font-bold">Request Return</h3>
              <p className="text-xs text-slate-400">Please provide a reason for returning {returnOrderItem?.product?.name}.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Reason for Return</label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={3}
                placeholder="Item defective, wrong size, etc."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border rounded-lg text-sm focus:outline-none resize-none"
                required
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReturnForm(false)}
                className="flex-1 py-2 border rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-dark-850"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReturn}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm"
              >
                {submittingReturn ? 'Filing...' : 'Submit Return Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
