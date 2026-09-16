import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axios.js';
import { useCartStore } from '../../store/cartStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { Star, Heart, ShoppingCart, ShieldCheck, RefreshCw, MessageSquarePlus, Play, Film } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeMedia, setActiveMedia] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Review writing state
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { isAuthenticated, role } = useAuthStore();
  const fetchCart = useCartStore((state) => state.fetchCart);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch product
      const resProduct = await axiosInstance.get(`/products/${id}`);
      setProduct(resProduct.data.data);
      
      // Select primary media
      const mediaList = resProduct.data.data.media || [];
      if (mediaList.length > 0) {
        setActiveMedia(mediaList[0]);
      } else {
        setActiveMedia({ type: 'IMAGE', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' });
      }

      // 2. Fetch reviews
      const resReviews = await axiosInstance.get(`/products/${id}/reviews`);
      setReviews(resReviews.data.data.reviews || []);

      // 3. Fetch wishlist status
      if (isAuthenticated && role === 'USER') {
        try {
          const resWishlist = await axiosInstance.get('/wishlist');
          const wishlist = resWishlist.data.data || [];
          const found = wishlist.find(w => w.product?.id === id);
          setIsWishlisted(!!found);
        } catch (e) {}
      }
    } catch (err) {
      toast.error('Product not found or has been deleted');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, isAuthenticated, role]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (role !== 'USER') {
      toast.error('Only customers can add items to cart');
      return;
    }

    try {
      await axiosInstance.post('/cart/items', { productId: product.id, quantity });
      await fetchCart();
      toast.success('Product added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    if (role !== 'USER') {
      toast.error('Only customers can use wishlist');
      return;
    }
    try {
      if (isWishlisted) {
        await axiosInstance.delete(`/wishlist/${product.id}`);
        toast.success('Product removed from wishlist');
        setIsWishlisted(false);
      } else {
        await axiosInstance.post('/wishlist', { productId: product.id });
        toast.success('Product added to wishlist');
        setIsWishlisted(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const payload = {
        rating: newRating,
        title: newTitle || undefined,
        body: newBody || undefined
      };
      
      const res = await axiosInstance.post(`/reviews/${product.id}`, payload);
      toast.success(res.data.message || 'Review submitted successfully!');
      
      // Clear review fields
      setNewTitle('');
      setNewBody('');
      setNewRating(5);
      
      // Reload reviews
      const resReviews = await axiosInstance.get(`/products/${id}/reviews`);
      setReviews(resReviews.data.data.reviews || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review. You can only review products you purchased.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  const hasDiscount = parseFloat(product.compareAtPrice) > parseFloat(product.price);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="space-y-6 md:space-y-12">
      {/* Product Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        
        {/* Left column: Media Showcase */}
        <div className="space-y-4">
          <div className="aspect-square w-full bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden relative shadow-sm">
            {activeMedia?.type === 'VIDEO' ? (
              <video
                src={activeMedia.url.startsWith('http') ? activeMedia.url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${activeMedia.url}`}
                controls
                className="w-full h-full object-contain p-2"
                poster={product.media?.find(m => m.type === 'IMAGE')?.url}
              />
            ) : (
              <img
                src={activeMedia?.url?.startsWith('http') ? activeMedia.url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${activeMedia?.url}`}
                alt={product.name}
                loading="eager"
                decoding="async"
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Thumbnails list */}
          {product.media && product.media.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.media.map((med) => (
                <button
                  key={med.id}
                  onClick={() => setActiveMedia(med)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeMedia?.id === med.id ? 'border-brand-600' : 'border-transparent'
                  }`}
                >
                  <img
                    src={med.type === 'VIDEO' ? (product.media.find(m => m.type === 'IMAGE')?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100') : (med.url.startsWith('http') ? med.url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${med.url}`)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain"
                  />
                  {med.type === 'VIDEO' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Details and Operations */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {product.category?.name || 'General'}
            </span>
            <h1 className="heading-display text-2xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">
              {product.name}
            </h1>
            
            {/* Rating summary */}
            <div className="flex items-center space-x-2">
              <span className="flex items-center text-amber-500">
                <Star className="w-5 h-5 fill-current mr-1" />
                {product.averageRating ? parseFloat(product.averageRating).toFixed(1) : 'No reviews'}
              </span>
              <span className="text-sm text-slate-400">({reviews.length} reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-3 p-4 bg-slate-100 dark:bg-dark-900 border dark:border-slate-800 rounded-2xl">
            <span className="text-xl md:text-3xl font-extrabold text-brand-600 dark:text-brand-400">
              {formatCurrency(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm md:text-base text-slate-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 border-y border-slate-200 dark:border-slate-800 py-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {product.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                <span>Return Window: {product.returnWindowDays} days</span>
              </div>
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-brand-500" />
                <span>Stock Left: <span className={isOutOfStock ? 'text-danger-text font-bold' : 'text-success-text font-bold'}>{isOutOfStock ? 'Out of stock' : `${product.stock} units`}</span></span>
              </div>
            </div>
          </div>

          {/* Product Operations */}
          {!isOutOfStock && (
            <div className="space-y-4">
              {/* Quantity */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold">Quantity:</span>
                <div className="flex items-center border dark:border-slate-800 rounded-lg">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-dark-950 dark:hover:bg-dark-900 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-dark-950 dark:hover:bg-dark-900 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex justify-center items-center py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className={`flex justify-center items-center p-3 border rounded-xl transition-colors cursor-pointer ${
                    isWishlisted 
                      ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-900/50 dark:bg-red-900/20' 
                      : 'border-slate-400 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-dark-850 text-slate-600 dark:text-slate-300'
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {isOutOfStock && (
            <div className="p-3 bg-danger-bg text-danger-text border border-danger-text/20 rounded-xl font-bold text-center">
              Currently Out of Stock
            </div>
          )}

          {/* Vendor Details */}
          {product.vendor && (
            <div className="text-xs text-slate-400 mt-2">
              Sold by: <span className="font-semibold text-slate-500 dark:text-slate-305">{product.vendor.vendorProfile?.businessName || product.vendor.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Review Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-200 dark:border-slate-800">
        
        {/* Write a review column */}
        <div className="space-y-4">
          <h2 className="heading-display text-xl font-bold flex items-center space-x-2">
            <MessageSquarePlus className="w-5 h-5 text-brand-500" />
            <span>Write a Review</span>
          </h2>
          
          {isAuthenticated ? (
            <form onSubmit={handleSubmitReview} className="space-y-4 p-5 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded-2xl shadow-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Rating:
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`text-2xl transition-colors ${
                        star <= newRating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Review Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Summarize your review"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Review Details
                </label>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Write your review here..."
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-300 dark:border-slate-800 rounded-lg text-sm focus:outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors text-sm cursor-pointer"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-dark-900 border dark:border-slate-800 rounded-2xl text-center text-sm text-slate-400">
              Please <Link to="/login" className="text-brand-600 font-bold hover:underline">Login</Link> to write a review.
            </div>
          )}
        </div>

        {/* Reviews List column */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="heading-display text-xl font-bold">
            Customer Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <p className="text-slate-400 dark:text-slate-500 italic text-sm">No reviews yet for this product. Be the first to share your thoughts!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      {/* Star rating */}
                      <div className="flex text-amber-500 mb-1 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{rev.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400">{formatDate(rev.createdAt)}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rev.body}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span>By: {rev.user?.name || 'Verified Purchaser'}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="px-2 py-0.5 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50 rounded-full font-bold">
                        Verified Purchase
                      </span>
                    )}
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
