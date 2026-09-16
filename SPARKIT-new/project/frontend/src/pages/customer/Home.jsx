import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios.js';
import { useCartStore } from '../../store/cartStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { formatCurrency } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { Search, SlidersHorizontal, Heart, ShoppingCart, Star, X } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([{ name: 'All Categories', slug: '' }]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStock, setInStock] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistItems, setWishlistItems] = useState(new Set());

  const { isAuthenticated, role, user } = useAuthStore();
  const fetchCart = useCartStore((state) => state.fetchCart);

  // Fetch categories from backend so the filter always matches what's in the DB
  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/products/categories');
      const dbCats = res.data.data || [];
      setCategories([
        { name: 'All Categories', slug: '' },
        ...dbCats.map(c => ({ name: c.name, slug: c.slug }))
      ]);
    } catch (_) {}
  };

  const fetchWishlist = async () => {
    if (isAuthenticated && role === 'USER') {
      try {
        const response = await axiosInstance.get('/wishlist');
        const items = response.data.data || [];
        const ids = new Set(items.map(w => w.product?.id).filter(Boolean));
        setWishlistItems(ids);
      } catch (err) {}
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        search,
        category,
        sortBy,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        inStock: inStock ? 'true' : undefined
      };
      
      const response = await axiosInstance.get('/products', { params });
      setProducts(response.data.data.products || []);
      // pagination object: { total, page, limit, pages }
      setTotalPages(response.data.data.pagination?.pages || response.data.data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, [category, sortBy, inStock, page, isAuthenticated, role]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
    setPage(1);
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (role !== 'USER') {
      toast.error('Only customers can add items to cart');
      return;
    }

    try {
      await axiosInstance.post('/cart/items', { productId, quantity: 1 });
      await fetchCart();
      toast.success('Product added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    if (role !== 'USER') {
      toast.error('Only customers can use wishlist');
      return;
    }
    try {
      if (wishlistItems.has(productId)) {
        await axiosInstance.delete(`/wishlist/${productId}`);
        setWishlistItems(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        toast.success('Removed from wishlist');
      } else {
        await axiosInstance.post('/wishlist', { productId });
        setWishlistItems(prev => {
          const next = new Set(prev);
          next.add(productId);
          return next;
        });
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner Section */}
      {isAuthenticated && role === 'USER' ? (
        /* Logged-in Customer personalized space */
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-700 via-indigo-900 to-slate-900 px-6 py-8 sm:px-8 sm:py-12 md:py-16 text-white shadow-2xl transition-all duration-300">
          {/* Modern Mesh Gradient Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.2),transparent_50%)]" />
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
          
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/10 text-brand-200">
                ✨ Personalized Hub
              </span>
              <div className="space-y-2">
                <h1 className="heading-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                  {getGreeting()}, <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">{user?.name || 'Customer'}</span>
                </h1>
                <p className="text-slate-200 text-sm md:text-base max-w-xl leading-relaxed">
                  Welcome back to your premium shopping experience. Explore new arrivals, track your pending orders, or manage your wishlist items.
                </p>
              </div>
              
              {/* Quick actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/orders" className="px-5 py-2.5 bg-white text-brand-700 hover:bg-slate-100 font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                  Track Orders
                </Link>
                <Link to="/wishlist" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl text-sm transition-all backdrop-blur-sm cursor-pointer">
                  My Wishlist
                </Link>
              </div>
            </div>
            
            {/* Decorative Premium Dashboard Card on the right */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="bg-slate-900/40 border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-inner space-y-4 relative overflow-hidden group hover:border-white/20 transition-all">
                {/* Glow */}
                <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-all duration-500"></div>
                
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-semibold text-slate-400">Account Summary</span>
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-ping"></span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Status</span>
                    <span className="font-semibold text-amber-300">Verified Client</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Email</span>
                    <span className="font-medium text-slate-200 truncate max-w-[180px]">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Shopping Tier</span>
                    <span className="font-bold bg-gradient-to-r from-amber-400 to-indigo-300 bg-clip-text text-transparent">Gold Member</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Unauthenticated Guest Landing Hero */
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-600 via-indigo-900 to-slate-900 px-6 py-10 sm:px-10 sm:py-16 md:py-20 text-white shadow-2xl">
          {/* Abstract decorative floating blobs */}
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-brand-400/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-1/4 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
            <div className="lg:col-span-8 space-y-6">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200">
                🚀 Platform V2 Live
              </span>
              <h1 className="heading-display text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
                Next-Gen E-Commerce <br />
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-indigo-300 bg-clip-text text-transparent">For Fast Growth</span>
              </h1>
              <p className="text-slate-200 text-sm md:text-lg max-w-xl leading-relaxed">
                Discover premium products verified by top vendors worldwide. Experience seamless browsing, lightning-fast ordering, and secure remittances.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/register"
                  className="px-8 py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold rounded-xl text-center shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-sm sm:text-base animate-pulse"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl text-center backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-sm sm:text-base"
                >
                  Sign In
                </Link>
              </div>
            </div>
            
            {/* Visual Card component on the right */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-red-400"></div>
                  <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-2/3 bg-white/10 rounded-md"></div>
                  <div className="h-10 w-full bg-white/5 rounded-md flex items-center px-3 justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">REMOTE_SECURE_PAY</span>
                    <span className="text-[10px] text-green-400 font-semibold">Active</span>
                  </div>
                  <div className="h-24 w-full bg-gradient-to-br from-indigo-500/10 to-brand-500/20 rounded-md flex items-center justify-center border border-white/5">
                    <span className="text-xs font-mono text-indigo-200">sparkit-secure-v2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and search panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm shadow-sm"
          />
          <button type="submit" className="absolute left-3 top-3 text-slate-400">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Filter controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-all ${
              showFilters 
                ? 'bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-900' 
                : 'bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-sm"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="p-6 bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in shadow-sm">
          {/* Categories */}
          <div>
            <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Category</span>
            <div className="flex flex-col space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => { setCategory(cat.slug); setPage(1); }}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    category === cat.slug
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Price Range</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-dark-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-dark-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Extra Checks */}
          <div className="flex flex-col space-y-3 justify-center">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span>In stock items only</span>
            </label>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-pulse">
              <div className="aspect-square w-full bg-slate-200 dark:bg-dark-850"></div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="h-3 w-1/4 bg-slate-200 dark:bg-dark-850 rounded mb-2"></div>
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-dark-850 rounded mb-3"></div>
                  <div className="h-3 w-20 bg-slate-200 dark:bg-dark-850 rounded mb-4"></div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                  <div className="h-5 w-16 bg-slate-200 dark:bg-dark-850 rounded"></div>
                  <div className="h-10 w-10 bg-slate-200 dark:bg-dark-850 rounded-xl"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">No products found matching filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => {
            const hasDiscount = parseFloat(product.compareAtPrice) > parseFloat(product.price);
            const isOutOfStock = product.stock <= 0;
            const isWishlisted = wishlistItems.has(product.id);

            // Media extraction
            const primaryMedia = product.media && product.media.length > 0
              ? product.media.find(m => m.type === 'IMAGE')?.url || product.media[0].url
              : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

            return (
              <div
                key={product.id}
                className="group relative flex flex-col bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Media Image container */}
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

                  {/* Slashed off Badge */}
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full shadow-sm">
                      Sale
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={() => handleAddToWishlist(product.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors ${
                      isWishlisted
                        ? 'bg-red-50 text-red-500 dark:bg-red-900/20'
                        : 'bg-white/80 dark:bg-dark-900/80 text-slate-500 hover:bg-white dark:hover:bg-dark-900 hover:text-red-500'
                    }`}
                    title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    {/* Category Label */}
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <span>{product.category?.name || 'General'}</span>
                      {product.averageRating && (
                        <span className="flex items-center text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                          {parseFloat(product.averageRating).toFixed(1)}
                        </span>
                      )}
                    </div>
                    {/* Product Name */}
                    <Link to={`/product/${product.id}`} className="block">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors text-sm line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-auto flex items-center justify-between">
                    {/* Prices */}
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                        {formatCurrency(product.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatCurrency(product.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    {/* Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={isOutOfStock}
                      className="p-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 dark:disabled:bg-dark-800 text-white disabled:text-slate-400 transition-colors cursor-pointer"
                      title={isOutOfStock ? 'Out of stock' : 'Add to Cart'}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-dark-800 text-sm font-semibold disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-dark-800 text-sm font-semibold disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Sell on SparkIT CTA Box */}
      {!isAuthenticated && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500/10 via-brand-500/5 to-indigo-500/10 dark:from-amber-950/20 dark:via-brand-900/10 dark:to-indigo-950/20 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-lg max-w-7xl mx-auto mt-12 transition-all hover:shadow-xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 z-10">
            <div className="space-y-4 text-center md:text-left max-w-xl">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                Grow Your Business
              </span>
              <h2 className="heading-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Sell on SparkIT Today!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                Reach thousands of customers worldwide. List your products on our next-gen platform with zero hassle, robust management tools, and instant verification.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-center">
              <Link
                to="/vendor/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-600 to-brand-600 hover:from-amber-700 hover:to-brand-700 text-white font-bold rounded-xl text-center shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Register as Vendor
              </Link>
              <div className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
                Already have a shop?{' '}
                <Link
                  to="/vendor/login"
                  className="font-semibold text-amber-600 hover:underline dark:text-amber-400"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
