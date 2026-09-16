import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios.js';
import { formatDate, formatCurrency } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { Recycle, ArrowLeft, Loader2, MapPin, User, CheckCircle2, AlertTriangle, ShieldCheck, Star } from 'lucide-react';

export default function VendorEwasteInspect() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form: Inspection states
  const [verifiedCondition, setVerifiedCondition] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');

  // Form: Finalize states
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const fetchRequestDetails = async () => {
    try {
      const response = await axiosInstance.get(`/ewaste/${id}`);
      setRequest(response.data.data);
      if (response.data.data.verifiedCondition) {
        setVerifiedCondition(response.data.data.verifiedCondition);
        setQuotedPrice(response.data.data.quotedPrice);
        setInspectionNotes(response.data.data.inspectionNotes || '');
      }
    } catch (err) {
      toast.error('Failed to load request details');
      navigate('/vendor/ewaste');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const handleInspectSubmit = async (e) => {
    e.preventDefault();
    if (!verifiedCondition || !quotedPrice) {
      toast.error('Please fill in all required fields');
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        verifiedCondition,
        quotedPrice,
        inspectionNotes
      };
      await axiosInstance.put(`/ewaste/${id}/inspect`, payload);
      toast.success('Inspection report and quotation submitted successfully!');
      fetchRequestDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit inspection');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalizePickup = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await axiosInstance.put(`/ewaste/${id}/complete`, { paymentMethod });
      toast.success('Pickup marked as completed and paid!');
      fetchRequestDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete transaction');
    } finally {
      setActionLoading(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/vendor/ewaste')}
        className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-xs font-semibold cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to List</span>
      </button>

      {/* Main card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: General details & status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h1 className="heading-display text-lg font-bold text-slate-800 dark:text-slate-100 capitalize">
                  {request.brand} {request.category}
                </h1>
                <p className="text-[10px] text-slate-400">
                  Request ID: #{request.id} | Listed {formatDate(request.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-900/50">
                  {request.status}
                </span>
              </div>
            </div>

            {/* Photos gallery */}
            {request.images && request.images.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-455 block">Photos</span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {request.images.map((url, idx) => (
                    <a
                      key={idx}
                      href={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border overflow-hidden aspect-square hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${url}`}
                        alt={`Ewaste ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Reported Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-dark-950 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Item Age</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{request.age} months</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Reported Accessories</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200">{request.accessories || 'None'}</span>
              </div>
              <div className="sm:col-span-2 border-t pt-2 mt-2">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold mb-1">Reported Condition</span>
                <p className="text-slate-650 dark:text-slate-400">{request.condition}</p>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-1.5" />
                  <span>Customer Contact</span>
                </h3>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{request.customer?.name}</p>
                  <p className="text-slate-500 dark:text-slate-400">{request.customer?.email}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  <span>Pickup Address</span>
                </h3>
                {request.address ? (
                  <div className="text-xs text-slate-650 dark:text-slate-400 bg-slate-50 dark:bg-dark-950 p-3 rounded-lg border">
                    <span className="font-bold text-[9px] uppercase bg-slate-250 dark:bg-dark-950 px-2 py-0.5 rounded text-slate-500 mb-1 inline-block">
                      {request.address.label}
                    </span>
                    <p>
                      {request.address.line1}, {request.address.line2 && `${request.address.line2}, `}{request.address.city}, {request.address.state} — {request.address.pincode}, {request.address.country}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No address provided</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Inspection Form & Finalize Collection */}
        <div className="space-y-6">
          
          {/* Form 1: Inspection & Quotation input */}
          {request.status === 'ACCEPTED' && (
            <div className="bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350 border-l-4 border-brand-600 pl-2">
                Physical Inspection
              </h3>

              <form onSubmit={handleInspectSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                    Verified Condition *
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Enter actual condition observed physically, parts broken/missing, screen condition..."
                    value={verifiedCondition}
                    onChange={(e) => setVerifiedCondition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                    Quoted Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Enter cash quotation"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                    Inspection Notes / Internal Remarks
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Extra information, e.g. components verified, customer agreement..."
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border dark:border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer flex justify-center items-center"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Inspection Report'}
                </button>
              </form>
            </div>
          )}

          {/* Form 2: Awaiting User status */}
          {request.status === 'QUOTE_PROVIDED' && (
            <div className="bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center space-x-1.5">
                <AlertTriangle className="w-5 h-5 text-amber-550 shrink-0" />
                <span>Inspection Report Filed</span>
              </h3>
              <p className="text-xs text-slate-500">
                You have quoted a price of <strong>{formatCurrency(request.quotedPrice)}</strong>. The request is currently waiting for the customer to either <strong>Accept</strong> or <strong>Reject</strong> the price.
              </p>
              <div className="bg-slate-50 dark:bg-dark-950 p-4 rounded-xl text-xs space-y-2 border">
                <p><strong>Verified Condition:</strong> {request.verifiedCondition}</p>
                {request.inspectionNotes && <p><strong>Notes:</strong> {request.inspectionNotes}</p>}
              </div>
            </div>
          )}

          {/* Form 3: Awaiting Admin Approval */}
          {request.status === 'QUOTE_ACCEPTED' && request.adminApprovalStatus === 'PENDING' && (
            <div className="bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center space-x-1.5">
                <ShieldCheck className="w-5 h-5 text-indigo-650 shrink-0 animate-pulse" />
                <span>Pending Admin Approval</span>
              </h3>
              <p className="text-xs text-slate-500">
                The user has accepted your quotation of <strong>{formatCurrency(request.quotedPrice)}</strong>. 
                Before you can collect the item and pay the user, the platform **Admin must approve the transaction**.
              </p>
            </div>
          )}

          {/* Form 4: Collect & Pay (Admin Approved) */}
          {request.status === 'QUOTE_ACCEPTED' && request.adminApprovalStatus === 'APPROVED' && (
            <div className="bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350 border-l-4 border-brand-600 pl-2">
                Collect & Finalize
              </h3>
              <p className="text-xs text-slate-500">
                The transaction is approved by the Admin. You are now authorized to pay the customer <strong>{formatCurrency(request.quotedPrice)}</strong> and collect the electronic items.
              </p>

              <form onSubmit={handleFinalizePickup} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border dark:border-slate-800 rounded-xl focus:outline-none"
                  >
                    <option value="COD">Cash on Collection (COD)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 block mt-1">Payment is executed directly in cash upon physical collection of the device.</span>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer flex justify-center items-center"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Collection & Pay'}
                </button>
              </form>
            </div>
          )}

          {/* Completed State */}
          {request.status === 'COMPLETED' && (
            <div className="bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-green-700 font-bold border-b pb-3 text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Pickup Completed</span>
              </div>
              <div className="text-xs space-y-2">
                <p><strong>Quoted Price:</strong> {formatCurrency(request.quotedPrice)}</p>
                <p><strong>Payment Status:</strong> PAID (Cash on Delivery)</p>
                <p><strong>Verified Condition:</strong> {request.verifiedCondition}</p>
                {request.inspectionNotes && <p><strong>Notes:</strong> {request.inspectionNotes}</p>}
              </div>

              {request.rating && (
                <div className="border-t pt-3 mt-3 space-y-1 bg-slate-50 dark:bg-dark-950 p-3 rounded-lg">
                  <span className="text-[9px] text-slate-455 font-bold uppercase block tracking-wider">Customer Rating</span>
                  <div className="flex items-center space-x-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= request.rating ? 'text-amber-505 fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  {request.review && (
                    <p className="text-[11px] text-slate-500 italic mt-1">"{request.review}"</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
