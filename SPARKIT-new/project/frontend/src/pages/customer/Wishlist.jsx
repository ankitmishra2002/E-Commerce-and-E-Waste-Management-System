import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios.js';
import { useCartStore } from '../../store/cartStore.js';
import { formatCurrency } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { Heart, Trash2, ShoppingCart, ShoppingBag } from 'lucide-react';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchCart = useCartStore((state) => state.fetchCart);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/wishlist');
      setWishlist(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveItem = async (productId) => {
    try {
      await axiosInstance.delete(`/wishlist/${productId}`);
      toast.success('Product removed from wishlist');
      fetchWishlist();
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await axiosInstance.post(`/wishlist/${productId}/move-to-cart`);
      toast.success('Product moved to cart!');
      await fetchCart();
      fetchWishlist();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to move product to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <Heart className="w-20 h-20 text-slate-305 dark:text-slate-700 animate-pulse" />
        <div>
          <h2 className="heading-display text-2xl font-bold mb-1">Your Wishlist is Empty</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            Save items you like here to purchase them later. Start exploring the store!
          </p>
        </div>
        <Link
          to="/"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-colors"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-4">
        <h1 className="heading-display text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center space-x-3">
          <Heart className="w-8 h-8 text-brand-600 dark:text-brand-500 fill-current" />
          <span>My Wishlist</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {wishlist.map((item) => {
          const product = item.product;
          if (!product) return null;
          const primaryMedia = product.thumbnail || (product.media && product.media.length > 0
            ? product.media.find(m => m.type === 'IMAGE')?.url || product.media[0].url
            : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300');
          const isOutOfStock = product.stock <= 0;

          return (
            <div
              key={item.id}
              className="flex flex-col bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative group"
            >
              {/* Media Thumbnail */}
              <div className="aspect-square w-full overflow-hidden relative bg-slate-100 dark:bg-dark-850">
                <Link to={`/product/${product.id}`} className="absolute inset-0">
                  <img
                      src={primaryMedia.startsWith('http') ? primaryMedia : `${import.meta.env.VITE_API_URL.replace('/api', '')}${primaryMedia}`}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/40 dark:bg-dark-900/40 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="px-3 py-1 bg-danger-bg text-danger-text text-[10px] font-bold uppercase rounded-full border border-danger-text/20 shadow-sm">Out of Stock</span>
                    </div>
                  )}
                
                {/* Trash option */}
                <button
                  onClick={() => handleRemoveItem(product.id)}
                  className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-dark-900/80 hover:bg-white dark:hover:bg-dark-900 text-slate-500 hover:text-red-500 rounded-full shadow-sm transition-colors"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Specs */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 line-clamp-1 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-4 mt-auto flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    {formatCurrency(product.price)}
                  </span>

                  <button
                    onClick={() => handleMoveToCart(product.id)}
                    disabled={isOutOfStock}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 dark:disabled:bg-dark-800 text-white disabled:text-slate-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
