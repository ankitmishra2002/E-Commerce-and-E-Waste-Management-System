import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios.js';
import { formatDate } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { Landmark, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/vendors');
      setVendors(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleVerify = async (profileId) => {
    setActionId(profileId);
    try {
      await axiosInstance.put(`/admin/vendors/${profileId}/verify`);
      toast.success('Vendor profile verified');
      fetchVendors();
    } catch (err) {
      toast.error('Failed to verify vendor');
    } finally {
      setActionId(null);
    }
  };

  const handleSuspend = async (profileId) => {
    if (!window.confirm('Are you sure you want to suspend this vendor?')) return;
    setActionId(profileId);
    try {
      await axiosInstance.put(`/admin/vendors/${profileId}/suspend`);
      toast.success('Vendor suspended successfully');
      fetchVendors();
    } catch (err) {
      toast.error('Failed to suspend vendor');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="heading-display text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 border-b pb-4">
        Vendor Operations
      </h1>

      <div className="bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm">
        {vendors.length === 0 ? (
          <p className="text-slate-400 text-sm italic text-center py-8">No vendors registered on the platform.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Business Name</th>
                  <th className="pb-3">GSTIN Number</th>
                  <th className="pb-3">Owner Contact</th>
                  <th className="pb-3">Date Registered</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {vendors.map((vp) => (
                  <tr key={vp.id} className="text-slate-600 dark:text-slate-400">
                    <td className="py-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{vp.businessName}</span>
                      <span className="text-[10px] text-slate-400 block max-w-[200px] truncate">{vp.businessDescription}</span>
                    </td>
                    <td className="py-4 font-mono">{vp.gstNumber || 'N/A'}</td>
                    <td className="py-4 font-medium">
                      <span>{vp.user?.name}</span>
                      <span className="text-[10px] text-slate-400 block">{vp.user?.email}</span>
                    </td>
                    <td className="py-4">{formatDate(vp.createdAt)}</td>
                    <td className="py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        vp.isVerified 
                          ? 'bg-success-bg text-success-text border-success-text/20' 
                          : 'bg-warning-bg text-warning-text border-warning-text/20'
                      }`}>
                        {vp.isVerified ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        {!vp.isVerified ? (
                          <button
                            onClick={() => handleVerify(vp.id)}
                            disabled={actionId === vp.id}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-755 text-white font-bold rounded transition-colors flex items-center cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Verify
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspend(vp.id)}
                            disabled={actionId === vp.id}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-bold rounded transition-colors flex items-center cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
