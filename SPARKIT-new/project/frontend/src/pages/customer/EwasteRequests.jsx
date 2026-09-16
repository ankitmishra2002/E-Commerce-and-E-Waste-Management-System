import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios.js';
import { formatDate, formatCurrency } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { Trash, Plus, Recycle, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, HeartCrack } from 'lucide-react';

export default function EwasteRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axiosInstance.get('/ewaste');
        setRequests(response.data.data || []);
      } catch (err) {
        toast.error('Failed to load your e-waste requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
            <Clock className="w-3.5 h-3.5 mr-1" /> Pending Assignment
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accepted by Vendor
          </span>
        );
      case 'QUOTE_PROVIDED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Quote Provided
          </span>
        );
      case 'QUOTE_ACCEPTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Quote Accepted (Pending Admin)
          </span>
        );
      case 'QUOTE_REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            <HeartCrack className="w-3.5 h-3.5 mr-1" /> Quote Rejected
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Collection Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            Cancelled
          </span>
        );
      default:
        return <span className="text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="heading-display text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <Recycle className="w-8 h-8 text-brand-600 dark:text-brand-500" />
            <span>E-Waste Recycling Hub</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Recycle your old electronics responsibly. Raise pickup requests and sell them directly to verified vendors.
          </p>
        </div>
        <Link
          to="/ewaste/new"
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Pickup Request</span>
        </Link>
      </div>

      {/* Requests list */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white dark:bg-dark-900 border rounded-2xl p-12 text-center shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center mx-auto">
            <Recycle className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          </div>
          <h3 className="heading-display text-lg font-bold text-slate-800 dark:text-slate-100">No Pickup Requests</h3>
          <p className="text-slate-500 dark:text-slate-450 text-xs max-w-md mx-auto">
            You haven't listed any old electronic items for recycling yet. Raise your first request to get started!
          </p>
          <Link
            to="/ewaste/new"
            className="inline-flex px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            Create Request
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="heading-display text-base font-bold text-slate-850 dark:text-slate-150 capitalize">
                      {req.brand} {req.category}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Requested on {formatDate(req.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {getStatusBadge(req.status)}
                  </div>
                </div>

                {/* Info Block */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-dark-950 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Estimated Age</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-350">{req.age} months</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Quoted Price</span>
                    <span className="font-bold text-brand-600 dark:text-brand-450">
                      {req.quotedPrice ? formatCurrency(req.quotedPrice) : 'Pending Inspection'}
                    </span>
                  </div>
                </div>

                {/* Brief reported condition */}
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block mb-1">Condition</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {req.condition}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center">
                <div className="text-[10px] text-slate-400">
                  ID: #{req.id.slice(0, 8)}
                </div>
                <Link
                  to={`/ewaste/${req.id}`}
                  className="flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-450 dark:hover:text-brand-350 group-hover:translate-x-1 transition-transform cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
