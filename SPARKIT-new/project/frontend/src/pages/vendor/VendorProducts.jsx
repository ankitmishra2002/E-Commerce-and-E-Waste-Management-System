import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios.js';
import { formatCurrency } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { ShoppingBag, Plus, Trash2, Edit, Camera, Film, Loader2, X, Eye, Package, ChevronDown, Info } from 'lucide-react';

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Product details form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [returnWindowDays, setReturnWindowDays] = useState(7);
  const [categoryId, setCategoryId] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  // Media files state
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/vendor/products');
      const prodList = res.data.data || [];
      setProducts(prodList);

      // Extract unique categories from products to populate dropdown
      const uniqueCats = [];
      prodList.forEach(p => {
        if (p.category && !uniqueCats.find(c => c.id === p.category.id)) {
          uniqueCats.push(p.category);
        }
      });
      
      // If we don't have categories, let's fetch a list of general products to find categories
      if (uniqueCats.length === 0) {
        const resAll = await axiosInstance.get('/products');
        resAll.data.data.products.forEach(p => {
          if (p.category && !uniqueCats.find(c => c.id === p.category.id)) {
            uniqueCats.push(p.category);
          }
        });
      }
      setCategories(uniqueCats);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCompareAtPrice('');
    setStock('');
    setSku('');
    setReturnWindowDays(7);
    setCategoryId(categories[0]?.id || '');
    setShowFormModal(true);
  };

  const handleOpenEditModal = (p) => {
    setSelectedProduct(p);
    setName(p.name);
    setDescription(p.description || '');
    setPrice(p.price);
    setCompareAtPrice(p.compareAtPrice || '');
    setStock(p.stock);
    setSku(p.sku || '');
    setReturnWindowDays(p.returnWindowDays);
    setCategoryId(p.categoryId || '');
    setShowFormModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const payload = {
        name,
        description: description || undefined,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        stock: parseInt(stock),
        sku: sku || undefined,
        returnWindowDays: parseInt(returnWindowDays),
        categoryId: categoryId || null
      };

      if (selectedProduct) {
        // Edit existing product
        await axiosInstance.put(`/products/${selectedProduct.id}`, payload);
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const res = await axiosInstance.post('/products', payload);
        toast.success('Product created successfully! Upload media next.');
        // Auto open media upload for new product
        setSelectedProduct(res.data.data);
        setSelectedImages([]);
        setImagePreviews([]);
        setSelectedVideo(null);
        setVideoPreview(null);
        setShowMediaModal(true);
      }
      setShowFormModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product details');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? (This can be undone by admins)')) return;
    try {
      await axiosInstance.delete(`/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleOpenMediaModal = (product) => {
    setSelectedProduct(product);
    setSelectedImages([]);
    setImagePreviews([]);
    setSelectedVideo(null);
    setVideoPreview(null);
    setShowMediaModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Enforce Max 8 images limit total
    const existingImagesCount = selectedProduct?.media?.filter(m => m.type === 'IMAGE').length || 0;
    if (existingImagesCount + files.length > 8) {
      toast.error(`Exceeds maximum limit of 8 images for this product. Already has ${existingImagesCount} images.`);
      return;
    }
    
    setSelectedImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleRemoveSelectedImage = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setSelectedVideo(null);
      setVideoPreview(null);
      return;
    }
    setSelectedVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleRemoveSelectedVideo = () => {
    setSelectedVideo(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
  };

  const handleCloseMediaModal = () => {
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setSelectedImages([]);
    setImagePreviews([]);
    setSelectedVideo(null);
    setVideoPreview(null);
    setShowMediaModal(false);
  };

  const handleUploadMedia = async (e) => {
    e.preventDefault();
    if (selectedImages.length === 0 && !selectedVideo) {
      toast.error('Please select at least one image or video to upload');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedImages.length; i++) {
      formData.append('images', selectedImages[i]);
    }
    if (selectedVideo) {
      formData.append('video', selectedVideo);
    }

    setUploadingMedia(true);
    try {
      await axiosInstance.post(`/products/${selectedProduct.id}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Media uploaded successfully!');
      
      // Clean up previews
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setSelectedImages([]);
      setImagePreviews([]);
      setSelectedVideo(null);
      setVideoPreview(null);
      setShowMediaModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload media. Ensure size limits (images < 2MB, video < 10MB)');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (productId, mediaId) => {
    if (!window.confirm('Delete this media?')) return;
    try {
      await axiosInstance.delete(`/products/${productId}/media/${mediaId}`);
      toast.success('Media deleted successfully');
      fetchProducts();
      // Reload details inside media modal if it's active
      const res = await axiosInstance.get(`/products/${productId}`);
      setSelectedProduct(res.data.data);
    } catch (err) {
      toast.error('Failed to delete media');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b pb-4 gap-4">
        <h1 className="heading-display text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
          My Products
        </h1>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-40">
          <Loader2 className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-900 rounded-2xl border border-dashed">
          <p className="text-slate-500 italic">No products registered yet. Click Add Product above to start selling!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const hasMedia = product.media && product.media.length > 0;
            const primaryImage = hasMedia
              ? product.media.find(m => m.type === 'IMAGE')?.url || product.media[0].url
              : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="aspect-square w-full bg-slate-100 dark:bg-dark-850 relative border-b border-slate-200 dark:border-slate-800 overflow-hidden">
                  <a href={`/product/${product.id}`} target="_blank" rel="noopener noreferrer" className="absolute inset-0">
                    <img
                      src={primaryImage.startsWith('http') ? primaryImage : `${import.meta.env.VITE_API_URL.replace('/api', '')}${primaryImage}`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                  
                  {/* Status Indicator */}
                  <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    product.isActive 
                      ? 'bg-success-bg text-success-text border-success-text/20' 
                      : 'bg-danger-bg text-danger-text border-danger-text/20'
                  }`}>
                    {product.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.category?.name || 'General'}</span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 hover:text-brand-600 transition-colors">
                      <a href={`/product/${product.id}`} target="_blank" rel="noopener noreferrer">
                        {product.name}
                      </a>
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
                  </div>

                  <div className="flex justify-between items-baseline text-xs font-semibold">
                    <span className="text-slate-500">Stock: <span className="font-bold text-slate-805 dark:text-slate-200">{product.stock} units</span></span>
                    <span className="text-sm font-bold text-brand-600">{formatCurrency(product.price)}</span>
                  </div>

                  <div className="pt-2 border-t flex justify-between space-x-2">
                    <button
                      onClick={() => handleOpenMediaModal(product)}
                      className="px-2.5 py-1.5 border hover:bg-slate-50 dark:hover:bg-dark-850 text-xs font-semibold rounded-lg flex items-center transition-colors cursor-pointer"
                      title="Manage Media Gallery"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1" />
                      Gallery ({product.media?.length || 0})
                    </button>
                    <div className="flex space-x-1">
                      <a
                        href={`/product/${product.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 border hover:bg-slate-50 dark:hover:bg-dark-850 text-slate-500 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                        title="View Public Page (Opens in new tab)"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-1.5 border hover:bg-slate-50 dark:hover:bg-dark-850 text-slate-500 rounded-lg transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 border hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Form Modal (Create or Edit Product details) */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <form
            onSubmit={handleSaveProduct}
            className="w-full max-w-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="heading-display text-xl font-bold text-slate-800 dark:text-slate-100">
                    {selectedProduct ? 'Edit Product' : 'Create New Product'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Fill in the details below to list your product on the marketplace.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
              
              {/* Section: Basic Info */}
              <div className="space-y-5">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Product Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Apex Smart Watch Series 5"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-slate-400"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Category</label>
                    <div className="relative">
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                      >
                        <option value="">Select a category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Describe your product's key features, specifications, and benefits..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-slate-400 resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Pricing & Inventory */}
              <div className="space-y-5">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Pricing & Inventory</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Price (USD) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="49.99"
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      Compare-at Price
                      <span className="group relative cursor-help">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-center z-10 leading-relaxed shadow-lg">Original price before discount. Will be shown with a strikethrough.</span>
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={compareAtPrice}
                        onChange={(e) => setCompareAtPrice(e.target.value)}
                        placeholder="79.99"
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Stock Quantity <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">SKU (Stock Keeping Unit)</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="APX-WT-900"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Return Window (Days) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={returnWindowDays}
                      onChange={(e) => setReturnWindowDays(e.target.value)}
                      placeholder="7"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProduct}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-sm hover:shadow transition-all flex items-center space-x-2"
              >
                {savingProduct && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>{savingProduct ? 'Saving...' : selectedProduct ? 'Save Changes' : 'Create Product'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Media Modal (Manage Gallery & Upload media) */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="heading-display text-xl font-bold text-slate-800 dark:text-slate-100">
                    Product Media Gallery
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {selectedProduct?.name}
                  </p>
                </div>
              </div>
              <button onClick={handleCloseMediaModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
              
              {/* List current media */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Current Media <span className="text-slate-400 font-normal">({selectedProduct?.media?.length || 0})</span></h4>
                </div>
                {selectedProduct?.media?.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-dark-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No images or videos uploaded yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedProduct?.media?.map((med) => (
                      <div key={med.id} className="relative aspect-square border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden group shadow-sm bg-white dark:bg-dark-900">
                        <img src={med.type === 'VIDEO' ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100' : (med.url.startsWith('http') ? med.url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${med.url}`)} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                        {med.type === 'VIDEO' && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                            <Film className="w-6 h-6 drop-shadow-md" />
                          </div>
                        )}
                        
                        {/* Delete button hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                          <button
                            onClick={() => handleDeleteMedia(selectedProduct.id, med.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-lg flex items-center space-x-1 transition-transform transform scale-95 group-hover:scale-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload media form */}
              <form onSubmit={handleUploadMedia} className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Upload New Media</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Images field */}
                  <div className="relative group">
                    <input
                      type="file"
                      id="image-upload-input"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-dark-950 group-hover:border-brand-500 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/10 transition-all text-center flex flex-col items-center justify-center h-full min-h-[140px]">
                      <div className="w-12 h-12 bg-white dark:bg-dark-900 rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6 text-slate-400 group-hover:text-brand-500 transition-colors" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Add Images</span>
                      <span className="text-[10px] text-slate-400 font-medium">JPG, PNG, WEBP (Max 8)</span>
                    </div>
                  </div>

                  {/* Video field */}
                  <div className="relative group">
                    <input
                      type="file"
                      id="video-upload-input"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-dark-950 group-hover:border-brand-500 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/10 transition-all text-center flex flex-col items-center justify-center h-full min-h-[140px]">
                      <div className="w-12 h-12 bg-white dark:bg-dark-900 rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Film className="w-6 h-6 text-slate-400 group-hover:text-brand-500 transition-colors" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Add Product Video</span>
                      <span className="text-[10px] text-slate-400 font-medium">MP4, MOV (Max 1)</span>
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                {(imagePreviews.length > 0 || videoPreview) && (
                  <div className="bg-slate-50 dark:bg-dark-950 rounded-2xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 space-y-5 animate-fade-in">
                    
                    {/* Local Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Images to Upload ({imagePreviews.length})</span>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                          {imagePreviews.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group/thumb shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900">
                              <img src={url} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                              <button
                                type="button"
                                onClick={() => handleRemoveSelectedImage(idx)}
                                className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-dark-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-full shadow-md opacity-0 group-hover/thumb:opacity-100 group-hover/thumb:top-1 group-hover/thumb:right-1 transition-all z-10 border border-slate-100 dark:border-slate-700"
                                title="Remove"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Local Video Preview */}
                    {videoPreview && (
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Video to Upload</span>
                        <div className="relative bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between shadow-sm">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                              <Film className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px] md:max-w-[300px]">{selectedVideo?.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveSelectedVideo}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Upload Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={uploadingMedia || (imagePreviews.length === 0 && !videoPreview)}
                    className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2"
                  >
                    {uploadingMedia && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{uploadingMedia ? 'Uploading Files...' : 'Confirm Upload'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
