import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios.js';
import { formatDate, formatCurrency } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { Recycle, Loader2, CheckCircle2, ShieldAlert, XCircle, Star, User, Building } from 'lucide-react';

export default function AdminEwaste() {
  const [activeTab, setActiveTab] = useState('all');
  const [requests, setRequests] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'all') {
        const response = await axiosInstance.get('/ewaste/admin/all');
        setRequests(response.data.data || []);
      } else if (activeTab === 'pending') {
        const response = await axiosInstance.get('/ewaste/admin/all');
        const all = response.data.data || [];
        // Filter those quote accepted and pending admin approval
        const filtered = all.filter(r => r.status === 'QUOTE_ACCEPTED' && r.adminApprovalStatus === 'PENDING');
        setPendingApprovals(filtered);
      } else {
        const response = await axiosInstance.get('/ewaste/admin/vendors');
        setVendors(response.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load admin E-waste data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAdminDecision = async (requestId, decision) => {
    if (!window.confirm(`Are you sure you want to ${decision.toLowerCase()} this transaction?`)) return;
    setActionId(requestId);
    try {
      await axiosInstance.put(`/ewaste/${requestId}/admin-approve`, { approvalStatus: decision });
      toast.success(`Transaction successfully ${decision.toLowerCase()}ed`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit decision');
    } finally {
      setActionId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-205';
      case 'ACCEPTED': return 'bg-blue-50 text-blue-705 border-blue-200';
      case 'QUOTE_PROVIDED': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'QUOTE_ACCEPTED': return 'bg-indigo-50 text-indigo-705 border-indigo-200';
      case 'QUOTE_REJECTED': return 'bg-red-50 text-red-700 border-red-200';
      case 'COMPLETED': return 'bg-green-50 text-green-705 border-green-200';
      case 'CANCELLED': return 'bg-slate-50 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="heading-display text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
          <Recycle className="w-8 h-8 text-brand-600 dark:text-brand-500" />
          <span>E-Waste Monitor Dashboard</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Monitor all e-waste transactions, approve/reject quote-accepted trades, track vendor ratings, and audit inspection reports.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 border-b-2 text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'border-brand-650 text-brand-650'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          All Requests ({activeTab === 'all' ? requests.length : '*'})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 border-b-2 text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'pending'
              ? 'border-brand-650 text-brand-650'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          Pending Approvals ({activeTab === 'pending' ? pendingApprovals.length : '*'})
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-6 py-3 border-b-2 text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'vendors'
              ? 'border-brand-650 text-brand-650'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          Vendor Performance ({activeTab === 'vendors' ? vendors.length : '*'})
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === 'all' ? (
        requests.length === 0 ? (
          <p className="text-slate-400 text-sm italic text-center py-16 bg-white dark:bg-dark-900 border rounded-2xl">
            No e-waste pickup requests listed on the platform yet.
          </p>
        ) : (
          <div className="bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Item details</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Address</th>
                  <th className="pb-3">Quoted Price</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Admin Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((req) => (
                  <tr key={req.id} className="text-slate-600 dark:text-slate-450 hover:bg-slate-50/20">
                    <td className="py-4">
                      <span className="font-bold text-slate-850 dark:text-slate-200 block capitalize">{req.brand} {req.category}</span>
                      <span className="text-[10px] text-slate-400 block">ID: #{req.id.slice(0, 8)}</span>
                    </td>
                    <td className="py-4 font-semibold">{req.customer?.name}</td>
                    <td className="py-4 max-w-[150px] truncate">{req.address ? `${req.address.line1}, ${req.address.city}` : 'N/A'}</td>
                    <td className="py-4 font-bold text-brand-600 dark:text-brand-450">
                      {req.quotedPrice ? formatCurrency(req.quotedPrice) : 'Pending'}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyle(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                        req.adminApprovalStatus === 'APPROVED' ? 'bg-green-50 text-green-700' :
                        req.adminApprovalStatus === 'REJECTED' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {req.adminApprovalStatus}
                      </span>
                    </td>
                    <td className="py-4">{formatDate(req.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : activeTab === 'pending' ? (
        pendingApprovals.length === 0 ? (
          <p className="text-slate-400 text-sm italic text-center py-16 bg-white dark:bg-dark-900 border rounded-2xl">
            No transactions waiting for admin approval.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingApprovals.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <h3 className="heading-display text-base font-bold text-slate-850 dark:text-slate-150 capitalize">
                        {req.brand} {req.category}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Listed {formatDate(req.createdAt)} | Quote Accepted by Customer
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-brand-600 dark:text-brand-450 block">
                        {formatCurrency(req.quotedPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Details Block */}
                  <div className="text-xs space-y-2 bg-slate-50 dark:bg-dark-950 p-4 rounded-xl border">
                    <p><strong>Customer:</strong> {req.customer?.name} ({req.customer?.email})</p>
                    <p><strong>Verified Condition:</strong> {req.verifiedCondition}</p>
                    {req.inspectionNotes && <p><strong>Inspection Notes:</strong> {req.inspectionNotes}</p>}
                    <p><strong>Pickup Address:</strong> {req.address ? `${req.address.line1}, ${req.address.city} — ${req.address.pincode}` : 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex gap-3">
                  <button
                    onClick={() => handleAdminDecision(req.id, 'APPROVED')}
                    disabled={actionId === req.id}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleAdminDecision(req.id, 'REJECTED')}
                    disabled={actionId === req.id}
                    className="flex-1 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-bold rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 mr-1.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        vendors.length === 0 ? (
          <p className="text-slate-400 text-sm italic text-center py-16 bg-white dark:bg-dark-900 border rounded-2xl">
            No registered vendors on the platform.
          </p>
        ) : (
          <div className="bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Vendor Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Completed Collections</th>
                  <th className="pb-3">Average E-Waste Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {vendors.map((v) => (
                  <tr key={v.vendorId} className="text-slate-600 dark:text-slate-450">
                    <td className="py-4 font-bold text-slate-850 dark:text-slate-200 flex items-center space-x-2">
                      <Building className="w-4 h-4 text-brand-650 shrink-0" />
                      <span>{v.name}</span>
                    </td>
                    <td className="py-4 font-medium">{v.email}</td>
                    <td className="py-4 font-bold text-slate-800 dark:text-slate-350">{v.completedCount} pickups</td>
                    <td className="py-4">
                      {v.averageRating > 0 ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-250">{v.averageRating}</span>
                          <div className="flex items-center space-x-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= Math.round(v.averageRating) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No ratings yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
