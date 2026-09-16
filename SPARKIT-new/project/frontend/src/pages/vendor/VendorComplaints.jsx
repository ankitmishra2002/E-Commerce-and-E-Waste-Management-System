import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios.js';
import { formatDate } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { AlertCircle, MessageSquare, CheckSquare, Loader2 } from 'lucide-react';

export default function VendorComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolution, setResolution] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/complaints/vendor');
      setComplaints(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!resolution.trim()) return;

    setSubmitting(true);
    try {
      await axiosInstance.put(`/complaints/${selectedComplaint.id}/respond`, { resolution });
      toast.success('Response submitted successfully');
      setResolution('');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-red-50 text-red-700 border-red-200';
      case 'IN_REVIEW': return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-205';
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
        Complaints Hub
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Complaints List */}
        <div className="lg:col-span-2 space-y-4">
          {complaints.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-dark-900 border rounded-2xl">
              <p className="text-slate-500 italic text-sm">No complaints filed against your products.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => setSelectedComplaint(comp)}
                  className={`p-5 bg-white dark:bg-dark-900 border rounded-2xl cursor-pointer transition-all shadow-sm ${
                    selectedComplaint?.id === comp.id
                      ? 'border-brand-600 bg-brand-50/5'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(comp.status)} mb-2`}>
                        {comp.status}
                      </span>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{comp.subject}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400">{formatDate(comp.createdAt)}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2">
                    {comp.body}
                  </p>

                  <div className="pt-4 border-t mt-3 flex justify-between items-center text-[10px] text-slate-400">
                    <span>Filed by: {comp.user?.name || 'Customer'}</span>
                    <span>Product: {comp.product?.name || 'General'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Resolution detail display */}
        <div>
          {selectedComplaint ? (
            <div className="p-6 bg-white dark:bg-dark-900 border border-slate-205 dark:border-slate-800 rounded-2xl space-y-6 shadow-sm lg:sticky lg:top-24">
              <div>
                <h3 className="heading-display text-base font-bold flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span>Complaint Detail</span>
                </h3>
                <span className="text-[10px] text-slate-400 block mt-1">ID: {selectedComplaint.id}</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-400 block">Customer Message:</span>
                  <p className="text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-dark-950 border rounded-lg leading-relaxed mt-1">{selectedComplaint.body}</p>
                </div>

                {selectedComplaint.resolution && (
                  <div>
                    <span className="font-bold text-slate-400 block">Existing Resolution:</span>
                    <p className="text-slate-700 dark:text-slate-300 p-3 bg-green-50/20 border border-green-200 rounded-lg leading-relaxed mt-1">{selectedComplaint.resolution}</p>
                  </div>
                )}
              </div>

              {/* Response action */}
              {selectedComplaint.status !== 'CLOSED' && (
                <form onSubmit={handleRespond} className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1 text-slate-400" />
                      <span>{selectedComplaint.resolution ? 'Update Resolution Response' : 'Write Resolution Response'}</span>
                    </label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Offer replacement, request info, confirm refund, etc."
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs focus:outline-none resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    ) : (
                      <CheckSquare className="w-4 h-4 mr-1.5" />
                    )}
                    <span>Submit Response</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="p-6 border border-dashed rounded-2xl text-center text-xs text-slate-400 py-12">
              Select a complaint from the list to view details and respond.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
