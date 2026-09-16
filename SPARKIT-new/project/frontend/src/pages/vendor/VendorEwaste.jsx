import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios.js';
import { formatDate, formatCurrency } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { Recycle, ArrowRight, Loader2, Calendar, ClipboardCheck, AlertCircle } from 'lucide-react';

export default function VendorEwaste() {
  const [activeTab, setActiveTab] = useState('available');
  const [availableRequests, setAvailableRequests] = useState([]);
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (activeTab === 'available') {
        const response = await axiosInstance.get('/ewaste/vendor/available');
        setAvailableRequests(response.data.data || []);
      } else {
        const response = await axiosInstance.get('/ewaste/vendor/assigned');
        setAssignedRequests(response.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const handleAccept = async (requestId) => {
    setActionId(requestId);
    try {
      await axiosInstance.put(`/ewaste/${requestId}/accept`);
      toast.success('Pickup request accepted! It is now in your assigned list.');
      // Refresh available requests
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'QUOTE_PROVIDED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'QUOTE_ACCEPTED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'QUOTE_REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-slate-50 text-slate-550 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="heading-display text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
          <Recycle className="w-8 h-8 text-brand-600 dark:text-brand-500" />
          <span>E-Waste Collection Panel</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Claim open recycling pickup requests, perform inspections, verify item condition, and complete pickup transactions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-6 py-3 border-b-2 text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'available'
              ? 'border-brand-650 text-brand-650'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          Available Pickups ({availableRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-6 py-3 border-b-2 text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'assigned'
              ? 'border-brand-650 text-brand-650'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          My Pickups ({assignedRequests.length})
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === 'available' ? (
        availableRequests.length === 0 ? (
          <p className="text-slate-400 text-sm italic text-center py-16 bg-white dark:bg-dark-900 border rounded-2xl">
            No pending e-waste pickup requests in your region.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="heading-display text-base font-bold text-slate-850 dark:text-slate-150 capitalize">
                        {req.brand} {req.category}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Listed {formatDate(req.createdAt)} by {req.customer?.name}
                      </p>
                    </div>
                  </div>

                  {req.address && (
                    <div className="text-xs text-slate-600 dark:text-slate-450 border-t border-b py-2.5 my-1 bg-slate-50 dark:bg-dark-950 px-3 rounded-lg">
                      <span className="font-bold text-[9px] uppercase tracking-wider block text-slate-400">Pickup Area</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {req.address.city}, {req.address.state} — {req.address.pincode}
                      </p>
                    </div>
                  )}

                  <div className="text-xs space-y-1 bg-slate-50 dark:bg-dark-950 p-3 rounded-lg">
                    <span className="text-[9px] text-slate-455 font-bold uppercase tracking-wider block">Reported Condition</span>
                    <p className="text-slate-650 dark:text-slate-400 line-clamp-2">{req.condition}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex justify-end">
                  <button
                    onClick={() => handleAccept(req.id)}
                    disabled={actionId === req.id}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center cursor-pointer shadow-sm"
                  >
                    {actionId === req.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <ClipboardCheck className="w-4 h-4 mr-1.5" />
                    )}
                    Accept Pickup
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : assignedRequests.length === 0 ? (
        <p className="text-slate-400 text-sm italic text-center py-16 bg-white dark:bg-dark-900 border rounded-2xl">
          You don't have any assigned pickup requests. Go to "Available Pickups" to accept requests.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Item details</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Pickup Address</th>
                <th className="pb-3">Quoted Price</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {assignedRequests.map((req) => (
                <tr key={req.id} className="text-slate-600 dark:text-slate-450 hover:bg-slate-50/20">
                  <td className="py-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block capitalize">{req.brand} {req.category}</span>
                    <span className="text-[10px] text-slate-400 block">ID: #{req.id.slice(0, 8)}</span>
                  </td>
                  <td className="py-4">
                    <span className="font-semibold block">{req.customer?.name}</span>
                    <span className="text-[10px] text-slate-400 block">{req.customer?.email}</span>
                  </td>
                  <td className="py-4 max-w-[200px] truncate">
                    {req.address ? `${req.address.line1}, ${req.address.city}` : 'N/A'}
                  </td>
                  <td className="py-4 font-bold text-brand-600 dark:text-brand-450">
                    {req.quotedPrice ? formatCurrency(req.quotedPrice) : 'Pending'}
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyle(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Link
                      to={`/vendor/ewaste/${req.id}`}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-dark-950 text-slate-700 dark:text-slate-300 font-bold rounded-lg border hover:bg-brand-50 dark:hover:bg-brand-950/20 hover:text-brand-650 dark:hover:text-brand-400 hover:border-brand-300 transition-all text-[11px]"
                    >
                      <span>Action</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
