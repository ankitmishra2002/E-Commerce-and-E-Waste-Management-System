import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios.js';
import { useAuthStore } from '../../store/authStore.js';
import toast from 'react-hot-toast';
import { User, Key, MapPin, Check, Trash2, Camera, Loader2, Plus, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required (e.g. Home, Office)'),
  line1: z.string().min(5, 'Address Line 1 must be at least 5 characters'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(4, 'Pincode is required'),
  country: z.string().min(1, 'Country is required')
});

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  
  // Profile settings state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Security state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  // Purchased items state
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(addressSchema)
  });

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await axiosInstance.get('/addresses');
      setAddresses(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load addresses');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchPurchases = async () => {
    setLoadingPurchases(true);
    try {
      const response = await axiosInstance.get('/orders');
      const ordersList = response.data.data?.orders || [];
      const items = [];
      ordersList.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            items.push({
              ...item,
              orderId: order.id,
              orderStatus: order.status,
              createdAt: order.createdAt,
              paymentMethod: order.paymentMethod,
              paymentStatus: order.paymentStatus
            });
          });
        }
      });
      setPurchasedItems(items);
    } catch (err) {
      console.error('Failed to load purchases', err);
    } finally {
      setLoadingPurchases(false);
    }
  };

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    if (user?.role === 'USER') {
      fetchAddresses();
      fetchPurchases();
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const response = await axiosInstance.put('/auth/me', { name, email });
      updateUser(response.data.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setUpdatingPassword(true);
    try {
      await axiosInstance.put('/auth/me/password', { oldPassword, newPassword });
      toast.success('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const response = await axiosInstance.post('/auth/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(response.data.data);
      toast.success('Avatar updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await axiosInstance.put(`/addresses/${addressId}/default`);
      toast.success('Default address updated');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to update default address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await axiosInstance.delete(`/addresses/${addressId}`);
      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  const handleAddNewAddress = async (data) => {
    setIsAddressLoading(true);
    try {
      await axiosInstance.post('/addresses', data);
      toast.success('Address added successfully');
      reset();
      setShowNewAddressForm(false);
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setIsAddressLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="heading-display text-3xl font-extrabold text-slate-800 dark:text-slate-100 border-b pb-4">
        My Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar and Info editing */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Avatar and Profile settings */}
          <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 shadow-sm">
            <h2 className="heading-display text-lg font-bold flex items-center space-x-2">
              <User className="w-5 h-5 text-brand-600" />
              <span>Personal Details</span>
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6 border-b pb-6">
              {/* Avatar upload */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-50 flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL.replace('/api', '')}${user.avatar}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-brand-500 uppercase">{user?.name?.slice(0, 2)}</span>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                </div>
                
                <label className="absolute bottom-0 right-0 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-full cursor-pointer shadow-md transition-colors">
                  <Camera className="w-4 h-4" />
                  <input type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
                </label>
              </div>

              {/* Text Info */}
              <div className="text-center sm:text-left space-y-1">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">{user?.name}</h3>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-info-bg text-info-text border border-info-text/20 mt-1.5">
                  Role: {user?.role}
                </span>
              </div>
            </div>

            {/* Profile Update Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-400 dark:border-slate-800 rounded-lg text-sm focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-400 dark:border-slate-800 rounded-lg text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {updatingProfile ? 'Saving...' : 'Save Profile Details'}
              </button>
            </form>
          </div>

          {/* Address Management (Only for customers) */}
          {user?.role === 'USER' && (
            <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="heading-display text-lg font-bold flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-brand-600" />
                  <span>My Addresses</span>
                </h2>
                <button
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>{showNewAddressForm ? 'Cancel' : 'Add Address'}</span>
                </button>
              </div>

              {/* Address Form */}
              {showNewAddressForm && (
                <form
                  onSubmit={handleSubmit(handleAddNewAddress)}
                  className="p-4 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 animate-fade-in"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        {...register('label')}
                        placeholder="Address Label (e.g. Home, Work)"
                        className="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-800 rounded text-xs focus:outline-none focus:border-brand-500"
                      />
                      {errors.label && <span className="text-[10px] text-red-500">{errors.label.message}</span>}
                    </div>
                    <div>
                      <input
                        type="text"
                        {...register('country')}
                        placeholder="Country"
                        className="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-800 rounded text-xs focus:outline-none focus:border-brand-500"
                      />
                      {errors.country && <span className="text-[10px] text-red-500">{errors.country.message}</span>}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      {...register('line1')}
                      placeholder="Address Line 1"
                      className="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-800 rounded text-xs focus:outline-none focus:border-brand-500"
                    />
                    {errors.line1 && <span className="text-[10px] text-red-500">{errors.line1.message}</span>}
                  </div>

                  <div>
                    <input
                      type="text"
                      {...register('line2')}
                      placeholder="Address Line 2 (Optional)"
                      className="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-800 rounded text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <input
                        type="text"
                        {...register('city')}
                        placeholder="City"
                        className="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-800 rounded text-xs focus:outline-none focus:border-brand-500"
                      />
                      {errors.city && <span className="text-[10px] text-red-500">{errors.city.message}</span>}
                    </div>
                    <div>
                      <input
                        type="text"
                        {...register('state')}
                        placeholder="State"
                        className="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-800 rounded text-xs focus:outline-none focus:border-brand-500"
                      />
                      {errors.state && <span className="text-[10px] text-red-500">{errors.state.message}</span>}
                    </div>
                    <div>
                      <input
                        type="text"
                        {...register('pincode')}
                        placeholder="Pincode"
                        className="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-800 rounded text-xs focus:outline-none focus:border-brand-500"
                      />
                      {errors.pincode && <span className="text-[10px] text-red-500">{errors.pincode.message}</span>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAddressLoading}
                    className="w-full py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs rounded transition-colors cursor-pointer"
                  >
                    {isAddressLoading ? 'Saving...' : 'Save Address'}
                  </button>
                </form>
              )}

              {loadingAddresses ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                </div>
              ) : addresses.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No addresses saved yet. You can add one during checkout.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="flex justify-between items-start p-4 border border-slate-200 dark:border-slate-800 rounded-xl"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-dark-950 px-2 py-0.5 rounded uppercase tracking-wider text-slate-500">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] font-bold text-success-text bg-success-bg px-1.5 py-0.5 rounded border border-success-text/20">Default</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} — {addr.pincode}, {addr.country}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="p-1 text-slate-400 hover:text-brand-600 rounded transition-colors"
                            title="Set Default Address"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                          title="Delete Address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Purchased Items Section */}
          {user?.role === 'USER' && (
            <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
              <h2 className="heading-display text-lg font-bold flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-brand-600" />
                <span>Things Bought ({purchasedItems.length})</span>
              </h2>

              {loadingPurchases ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                </div>
              ) : purchasedItems.length === 0 ? (
                <p className="text-xs text-slate-400 italic">You haven't bought anything yet. Explore the shop to make your first purchase!</p>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {purchasedItems.map((item, idx) => {
                    const product = item.product;
                    if (!product) return null;
                    const primaryMedia = product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                    return (
                      <div
                        key={`${item.id}-${idx}`}
                        className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-850 transition-all gap-4"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-dark-850 flex-shrink-0 flex items-center justify-center">
                            <img
                              src={primaryMedia.startsWith('http') ? primaryMedia : `${import.meta.env.VITE_API_URL.replace('/api', '')}${primaryMedia}`}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                              {product.name}
                            </h4>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                              <span>Qty: <span className="font-bold">{item.quantity}</span></span>
                              <span>•</span>
                              <span>Price: <span className="font-semibold">{formatCurrency(parseFloat(item.priceAtPurchase))}</span></span>
                              <span>•</span>
                              <span>Date: <span>{new Date(item.createdAt).toLocaleDateString()}</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            item.orderStatus === 'DELIVERED'
                              ? 'bg-success-bg text-success-text border border-success-text/20'
                              : item.orderStatus === 'CANCELLED'
                              ? 'bg-danger-bg text-danger-text border border-danger-text/20'
                              : 'bg-warning-bg text-warning-text border border-warning-text/20'
                          }`}>
                            {item.orderStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Security */}
        <div>
          <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
            <h2 className="heading-display text-lg font-bold flex items-center space-x-2">
              <Key className="w-5 h-5 text-brand-600" />
              <span>Change Password</span>
            </h2>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-400 dark:border-slate-800 rounded-lg text-sm focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-400 dark:border-slate-800 rounded-lg text-sm focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
