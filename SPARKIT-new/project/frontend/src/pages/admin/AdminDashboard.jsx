import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { Users, Landmark, AlertTriangle, CreditCard, CheckCircle, Ban, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchDashboard = async () => {
    try {
      const resDash = await axiosInstance.get('/admin/dashboard');
      setData(resDash.data.data);

      const resAnal = await axiosInstance.get('/admin/analytics');
      setAnalytics(resAnal.data.data);
    } catch (err) {
      toast.error('Failed to load administrative analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleVerifyVendor = async (profileId) => {
    setProcessingId(profileId);
    try {
      await axiosInstance.put(`/admin/vendors/${profileId}/verify`);
      toast.success('Vendor verified successfully');
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to verify vendor');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSuspendVendor = async (profileId) => {
    if (!window.confirm('Suspend this vendor?')) return;
    setProcessingId(profileId);
    try {
      await axiosInstance.put(`/admin/vendors/${profileId}/suspend`);
      toast.success('Vendor suspended successfully');
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to suspend vendor');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { stats, pendingVerification, recentComplaints } = data || {};
  const salesHistory = analytics?.salesHistory || [];

  return (
    <div className="space-y-8">
      <h1 className="heading-display text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 border-b pb-4">
        Admin Dashboard
      </h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Platform GMV</span>
            <span className="text-xl font-black text-slate-855 dark:text-slate-100">{formatCurrency(stats?.totalSales || 0)}</span>
          </div>
          <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Registered Users</span>
            <span className="text-xl font-black text-slate-855 dark:text-slate-100">{stats?.totalUsers || 0}</span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Verified Vendors</span>
            <span className="text-xl font-black text-slate-855 dark:text-slate-100">{stats?.totalVendors || 0}</span>
          </div>
          <div className="p-3 bg-success-bg rounded-xl text-success-text border border-success-text/10">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Open Complaints</span>
            <span className="text-xl font-black text-slate-855 dark:text-slate-100">{stats?.openComplaints || 0}</span>
          </div>
          <div className="p-3 bg-danger-bg rounded-xl text-danger-text border border-danger-text/10">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Chart */}
      {salesHistory.length > 0 && (
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <h3 className="heading-display text-base font-bold mb-6">Platform Sales Revenue Timeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bottom Grid: Vendor Verification Queue & Recent Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Verification Queue */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
          <h3 className="heading-display text-base font-bold">Pending Vendor Verification Queue</h3>

          {pendingVerification?.length === 0 ? (
            <p className="text-slate-400 text-xs italic">No vendors currently awaiting verification.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
              {pendingVerification?.map((vp) => (
                <div key={vp.id} className="pt-3 first:pt-0 flex justify-between items-start text-xs gap-4">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 block">{vp.businessName}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Owner: {vp.user?.name} ({vp.user?.email})</span>
                    <span className="text-[10px] text-slate-400 block">GSTIN: {vp.gstNumber || 'N/A'}</span>
                  </div>

                  <div className="flex space-x-2 shrink-0">
                    <button
                      onClick={() => handleVerifyVendor(vp.id)}
                      disabled={processingId === vp.id}
                      className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded flex items-center transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleSuspendVendor(vp.id)}
                      disabled={processingId === vp.id}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 font-bold rounded flex items-center transition-colors cursor-pointer border border-red-200"
                    >
                      <Ban className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complaints Overview */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
          <h3 className="heading-display text-base font-bold">Recent Platform Complaints</h3>

          {recentComplaints?.length === 0 ? (
            <p className="text-slate-400 text-xs italic">No complaints registered recently.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
              {recentComplaints?.map((comp) => (
                <div key={comp.id} className="pt-3 first:pt-0 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100 truncate flex-1 min-w-0 mr-4">{comp.subject}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{formatDate(comp.createdAt)}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] line-clamp-1 mt-1">{comp.body}</p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-warning-bg text-warning-text border border-warning-text/20">
                      {comp.status}
                    </span>
                    <span className="text-[10px] text-slate-400">Against Vendor ID: {comp.vendorId || 'Admin'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
