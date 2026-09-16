import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios.js';
import { formatDate, formatCurrency } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { Recycle, ArrowLeft, Loader2, MapPin, Star, User, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function EwasteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Rating states
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const fetchRequestDetails = async () => {
    try {
      const response = await axiosInstance.get(`/ewaste/${id}`);
      setRequest(response.data.data);
      if (response.data.data.rating) {
        setRatingSubmitted(true);
      }
    } catch (err) {
      toast.error('Failed to load request details');
      navigate('/ewaste');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const handleQuoteResponse = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this price quote?`)) return;
    setActionLoading(true);
    try {
      await axiosInstance.put(`/ewaste/${id}/quote`, { action });
      toast.success(`Quote ${action.toLowerCase()}ed successfully`);
      fetchRequestDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quote action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await axiosInstance.post(`/ewaste/${id}/rate`, { rating, review: reviewText });
      toast.success('Thank you for your rating and feedback!');
      setRatingSubmitted(true);
      fetchRequestDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return { text: 'Waiting for Assignment', classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' };
      case 'ACCEPTED': return { text: 'Vendor Assigned', classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' };
      case 'QUOTE_PROVIDED': return { text: 'Quote Provided', classes: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' };
      case 'QUOTE_ACCEPTED': return { text: 'Quote Accepted', classes: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800' };
      case 'QUOTE_REJECTED': return { text: 'Quote Rejected', classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' };
      case 'COMPLETED': return { text: 'Completed', classes: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' };
      case 'CANCELLED': return { text: 'Cancelled', classes: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' };
      default: return { text: status, classes: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/ewaste')}
        className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-xs font-semibold cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Hub</span>
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
                  Request ID: #{request.id} | Created {formatDate(request.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold border ${getStatusBadge(request.status).classes}`}>
                  {getStatusBadge(request.status).text}
                </span>
              </div>
            </div>

            {/* Photos gallery */}
            {request.images && request.images.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Uploaded Photos</span>
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

            {/* Item Info Grid */}
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

            {/* Pickup Location */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Pickup Location</span>
              {request.address ? (
                <div className="flex items-start text-xs border p-4 rounded-xl bg-slate-50/50 dark:bg-dark-950/20">
                  <MapPin className="w-4 h-4 mr-2.5 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[10px] bg-slate-200 dark:bg-dark-950 px-2 py-0.5 rounded uppercase tracking-wider text-slate-500">
                      {request.address.label}
                    </span>
                    <p className="mt-1.5 text-slate-650 dark:text-slate-400">
                      {request.address.line1}, {request.address.line2 && `${request.address.line2}, `}{request.address.city}, {request.address.state} — {request.address.pincode}, {request.address.country}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No address attached</p>
              )}
            </div>
          </div>

          {/* Quote & Inspection Section */}
          {(request.status === 'QUOTE_PROVIDED' || request.status === 'QUOTE_ACCEPTED' || request.status === 'QUOTE_REJECTED' || request.status === 'COMPLETED') && (
            <div className="bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="heading-display text-sm font-bold text-slate-800 dark:text-slate-200 border-l-4 border-brand-600 pl-2">
                Vendor Inspection Report
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-50/20 dark:bg-purple-950/10 p-4 rounded-xl border border-purple-200/40 text-xs">
                  <div>
                    <span className="text-purple-600 dark:text-purple-400 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Quoted Price</span>
                    <span className="text-base font-extrabold text-purple-750 dark:text-purple-350">
                      {formatCurrency(request.quotedPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-600 dark:text-purple-400 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Payment Method</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {request.paymentMethod || 'Cash on Delivery (COD)'}
                    </span>
                  </div>
                  <div className="sm:col-span-2 border-t border-purple-200/30 pt-2 mt-2">
                    <span className="text-purple-600 dark:text-purple-400 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Verified Condition</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{request.verifiedCondition}</p>
                  </div>
                  {request.inspectionNotes && (
                    <div className="sm:col-span-2 border-t border-purple-200/30 pt-2 mt-2">
                      <span className="text-purple-600 dark:text-purple-400 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Inspection Notes</span>
                      <p className="text-slate-650 dark:text-slate-400">{request.inspectionNotes}</p>
                    </div>
                  )}
                </div>

                {/* Accept/Reject Quote controls */}
                {request.status === 'QUOTE_PROVIDED' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleQuoteResponse('ACCEPT')}
                      disabled={actionLoading}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-colors text-xs cursor-pointer flex justify-center items-center"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept Quote'}
                    </button>
                    <button
                      onClick={() => handleQuoteResponse('REJECT')}
                      disabled={actionLoading}
                      className="flex-1 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-xl transition-colors text-xs cursor-pointer flex justify-center items-center"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject Quote'}
                    </button>
                  </div>
                )}

                {/* Admin Status notifications */}
                {request.status === 'QUOTE_ACCEPTED' && request.adminApprovalStatus === 'PENDING' && (
                  <div className="flex items-center space-x-3 p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/55 rounded-xl text-xs">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <p><strong>Quote Accepted!</strong> The transaction is currently waiting for Admin approval before the vendor completes pickup & payment.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Vendor Info & Rating form */}
        <div className="space-y-6">
          {/* Vendor Details */}
          {request.vendor && (
            <div className="bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center space-x-2">
                <User className="w-4.5 h-4.5 text-brand-600" />
                <span>Assigned Vendor</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Business / Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{request.vendor.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Email</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-400">{request.vendor.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Rating section */}
          {request.status === 'COMPLETED' && (
            <div className="bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Rate Vendor Performance
              </h3>

              {ratingSubmitted ? (
                <div className="space-y-3 bg-slate-50 dark:bg-dark-950 p-4 rounded-xl text-xs border">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4.5 h-4.5 ${
                          star <= (request.rating || rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  {request.review && (
                    <p className="text-slate-600 dark:text-slate-400 italic">
                      "{request.review}"
                    </p>
                  )}
                  <span className="text-[10px] text-green-600 font-bold block flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Feedback submitted
                  </span>
                </div>
              ) : (
                <form onSubmit={handleRatingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Rating</label>
                    <div className="flex items-center space-x-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-350 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Review / Feedback</label>
                    <textarea
                      rows="2"
                      placeholder="Share your experience with the vendor pickup and service..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors text-xs cursor-pointer flex justify-center items-center shadow-md"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Feedback'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
