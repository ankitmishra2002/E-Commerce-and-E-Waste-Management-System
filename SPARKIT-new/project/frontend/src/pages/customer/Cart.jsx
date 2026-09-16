import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore.js';
import { formatCurrency } from '../../utils/formatters.js';
import axiosInstance from '../../api/axios.js';
import toast from 'react-hot-toast';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';

export default function Cart() {
  const { items, cartTotal, isLoading, fetchCart, clearCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axiosInstance.put(`/cart/items/${itemId}`, { quantity: newQuantity });
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axiosInstance.delete(`/cart/items/${itemId}`);
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    try {
      await axiosInstance.delete('/cart');
      clearCart();
      toast.success('Cart cleared');
    } catch (err) {
      toast.error('Failed to clear cart');
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <ShoppingBag className="w-20 h-20 text-slate-300 dark:text-slate-700 animate-bounce" />
        <div>
          <h2 className="heading-display text-2xl font-bold mb-1">Your Cart is Empty</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            Looks like you haven't added anything to your cart yet. Let's find some amazing items!
          </p>
        </div>
        <Link
          to="/"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-baseline border-b pb-4">
        <h1 className="heading-display text-3xl font-extrabold text-slate-800 dark:text-slate-100">
          Shopping Cart
        </h1>
        <button
          onClick={handleClearCart}
          className="text-sm font-semibold text-red-500 hover:text-red-650 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            const primaryMedia = product.thumbnail || (product.media && product.media.length > 0
              ? product.media.find(m => m.type === 'IMAGE')?.url || product.media[0].url
              : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200');

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl gap-4 shadow-sm"
              >
                {/* Left: Media and Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-850 flex-shrink-0">
                    <img
                      src={primaryMedia.startsWith('http') ? primaryMedia : `${import.meta.env.VITE_API_URL.replace('/api', '')}${primaryMedia}`}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <Link to={`/product/${product.id}`} className="hover:text-brand-600 dark:hover:text-brand-400">
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">
                        {product.name}
                      </h4>
                    </Link>
                    <span className="text-xs text-slate-400">Unit Price: {formatCurrency(product.price)}</span>
                  </div>
                </div>

                {/* Right: Quantity modifiers and Price */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8">
                  {/* Quantity adjustments */}
                  <div className="flex items-center border dark:border-slate-800 rounded-lg">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-dark-950 dark:hover:bg-dark-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-0.5 text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-dark-950 dark:hover:bg-dark-900"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Total price */}
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    {formatCurrency(parseFloat(product.price) * item.quantity)}
                  </span>

                  {/* Trash item */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-50 dark:hover:bg-dark-850 transition-all"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summaries Column */}
        <div>
          <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 shadow-sm">
            <h3 className="heading-display text-lg font-bold">Order Summary</h3>
            
            <div className="space-y-3 text-sm border-b pb-4">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="text-success-text font-bold">Free</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-base text-slate-800 dark:text-slate-100">
              <span>Total Amount</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex justify-center items-center py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
