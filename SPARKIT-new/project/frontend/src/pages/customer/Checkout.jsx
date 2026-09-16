import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '../../store/cartStore.js';
import { formatCurrency } from '../../utils/formatters.js';
import axiosInstance from '../../api/axios.js';
import toast from 'react-hot-toast';
import { MapPin, Plus, Landmark, CreditCard, Loader2 } from 'lucide-react';

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required (e.g. Home, Office)'),
  line1: z.string().min(5, 'Address Line 1 must be at least 5 characters'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(4, 'Pincode is required'),
  country: z.string().min(1, 'Country is required')
});

export default function Checkout() {
  const { items, cartTotal, fetchCart, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(addressSchema)
  });

  const fetchAddresses = async () => {
    try {
      const res = await axiosInstance.get('/addresses');
      const addressList = res.data.data || [];
      setAddresses(addressList);
      
      // Auto select default address if it exists
      const defaultAddr = addressList.find(a => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addressList.length > 0) {
        setSelectedAddressId(addressList[0].id);
      }
    } catch (err) {
      toast.error('Failed to load shipping addresses');
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    fetchAddresses();
  }, [items]);

  const handleAddNewAddress = async (data) => {
    setIsAddressLoading(true);
    try {
      const response = await axiosInstance.post('/addresses', data);
      toast.success('Address added successfully');
      reset();
      setShowNewAddressForm(false);
      
      // Reload and auto select new address
      const res = await axiosInstance.get('/addresses');
      const addressList = res.data.data || [];
      setAddresses(addressList);
      
      const newAddress = addressList.find(a => a.line1 === data.line1);
      if (newAddress) {
        setSelectedAddressId(newAddress.id);
      } else if (addressList.length > 0) {
        setSelectedAddressId(addressList[addressList.length - 1].id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        addressId: selectedAddressId,
        paymentMethod
      };

      const response = await axiosInstance.post('/orders', payload);
      const createdOrder = response.data.data;
      toast.success('Order placed successfully!');
      
      // Clear Cart state & redirect to success screen
      clearCart();
      navigate(`/payment-success?orderId=${createdOrder.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order placement failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="heading-display text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 border-b pb-4">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Address Selection and Payments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shipping Addresses Section */}
          <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="heading-display text-lg font-bold flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-brand-600" />
                <span>1. Shipping Address</span>
              </h2>
              <button
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
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
                      className="w-full px-3 py-2 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded text-xs focus:outline-none"
                    />
                    {errors.label && <span className="text-[10px] text-red-500">{errors.label.message}</span>}
                  </div>
                  <div>
                    <input
                      type="text"
                      {...register('country')}
                      placeholder="Country"
                      className="w-full px-3 py-2 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded text-xs focus:outline-none"
                    />
                    {errors.country && <span className="text-[10px] text-red-500">{errors.country.message}</span>}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    {...register('line1')}
                    placeholder="Address Line 1"
                    className="w-full px-3 py-2 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded text-xs focus:outline-none"
                  />
                  {errors.line1 && <span className="text-[10px] text-red-500">{errors.line1.message}</span>}
                </div>

                <div>
                  <input
                    type="text"
                    {...register('line2')}
                    placeholder="Address Line 2 (Optional)"
                    className="w-full px-3 py-2 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      {...register('city')}
                      placeholder="City"
                      className="w-full px-3 py-2 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded text-xs focus:outline-none"
                    />
                    {errors.city && <span className="text-[10px] text-red-500">{errors.city.message}</span>}
                  </div>
                  <div>
                    <input
                      type="text"
                      {...register('state')}
                      placeholder="State"
                      className="w-full px-3 py-2 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded text-xs focus:outline-none"
                    />
                    {errors.state && <span className="text-[10px] text-red-500">{errors.state.message}</span>}
                  </div>
                  <div>
                    <input
                      type="text"
                      {...register('pincode')}
                      placeholder="Pincode"
                      className="w-full px-3 py-2 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded text-xs focus:outline-none"
                    />
                    {errors.pincode && <span className="text-[10px] text-red-500">{errors.pincode.message}</span>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAddressLoading}
                  className="w-full py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs rounded transition-colors"
                >
                  {isAddressLoading ? 'Saving...' : 'Save Address'}
                </button>
              </form>
            )}

            {/* List of existing addresses */}
            {addresses.length === 0 ? (
              <p className="text-slate-400 text-xs italic">No addresses saved. Please add a shipping address above to proceed.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-brand-600 bg-brand-50/20 dark:bg-brand-900/10'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-dark-850'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingAddress"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 text-brand-600 focus:ring-brand-500"
                    />
                    <div className="ml-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold bg-slate-100 dark:bg-dark-950 px-2 py-0.5 rounded uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[9px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} — {addr.pincode}, {addr.country}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method section */}
          <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
            <h2 className="heading-display text-lg font-bold flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-brand-600" />
              <span>2. Payment Method</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* COD */}
              <label
                onClick={() => setPaymentMethod('COD')}
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-brand-600 bg-brand-50/20 dark:bg-brand-900/10'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="text-brand-600 focus:ring-brand-500"
                />
                <div className="ml-3">
                  <span className="text-sm font-bold flex items-center text-slate-800 dark:text-slate-200">
                    <Landmark className="w-4 h-4 mr-1.5 text-slate-500" />
                    Cash On Delivery
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Pay in cash upon delivery of package.</span>
                </div>
              </label>

              {/* CARD SIMULATION */}
              <label
                onClick={() => setPaymentMethod('CARD')}
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-brand-600 bg-brand-50/20 dark:bg-brand-900/10'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                  className="text-brand-600 focus:ring-brand-500"
                />
                <div className="ml-3">
                  <span className="text-sm font-bold flex items-center text-slate-800 dark:text-slate-200">
                    <CreditCard className="w-4 h-4 mr-1.5 text-slate-500" />
                    Simulated Card (Razorpay-ready)
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Simulate instant checkout.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary Checkout */}
        <div>
          <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 shadow-sm lg:sticky lg:top-24">
            <h3 className="heading-display text-lg font-bold">Purchase Summary</h3>
            
            <div className="space-y-4 max-h-60 overflow-y-auto border-b pb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs text-slate-600 gap-2">
                  <div className="truncate w-full max-w-[150px] sm:max-w-none flex-1">
                    <span className="font-bold">{item.quantity}x</span> {item.product?.name}
                  </div>
                  <span className="font-semibold">{formatCurrency(parseFloat(item.product?.price) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm border-b pb-4">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="text-green-500 font-semibold">Free</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-base text-slate-800 dark:text-slate-100">
              <span>Total Amount</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isLoading || !selectedAddressId}
              className="w-full flex justify-center items-center py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
