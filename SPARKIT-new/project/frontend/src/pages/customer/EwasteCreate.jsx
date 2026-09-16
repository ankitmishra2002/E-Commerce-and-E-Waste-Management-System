import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios.js';
import toast from 'react-hot-toast';
import { Recycle, ArrowLeft, Loader2, MapPin, Plus, Image as ImageIcon } from 'lucide-react';

export default function EwasteCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  // Form Fields State
  const [category, setCategory] = useState('mobile');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('');
  const [age, setAge] = useState('');
  const [accessories, setAccessories] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);

  // New Address Form State
  const [addressLabel, setAddressLabel] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressPincode, setAddressPincode] = useState('');
  const [addressCountry, setAddressCountry] = useState('India');

  // Load Shipping Addresses
  const fetchAddresses = async () => {
    try {
      const res = await axiosInstance.get('/addresses');
      const addressList = res.data.data || [];
      setAddresses(addressList);
      
      const defaultAddr = addressList.find(a => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addressList.length > 0) {
        setSelectedAddressId(addressList[0].id);
      }
    } catch (err) {
      toast.error('Failed to load your addresses');
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!addressLabel || !addressLine1 || !addressCity || !addressState || !addressPincode) {
      toast.error('Please fill in all required address fields');
      return;
    }
    setIsAddressLoading(true);
    try {
      const payload = {
        label: addressLabel,
        line1: addressLine1,
        line2: addressLine2 || null,
        city: addressCity,
        state: addressState,
        pincode: addressPincode,
        country: addressCountry
      };
      await axiosInstance.post('/addresses', payload);
      toast.success('Address added successfully');
      
      // Reset address form
      setAddressLabel('');
      setAddressLine1('');
      setAddressLine2('');
      setAddressCity('');
      setAddressState('');
      setAddressPincode('');
      setShowNewAddressForm(false);

      // Reload addresses
      await fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length + selectedImages.length > 5) {
        toast.error('You can upload up to 5 photos maximum');
        return;
      }
      setSelectedImages([...selectedImages, ...filesArray]);
    }
  };

  const removeSelectedImage = (indexToRemove) => {
    setSelectedImages(selectedImages.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!brand || !condition || !age || !selectedAddressId) {
      toast.error('Please fill in all required fields and select a pickup address');
      return;
    }
    if (selectedImages.length === 0) {
      toast.error('Please upload at least one photo of the item');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('brand', brand);
      formData.append('condition', condition);
      formData.append('age', age);
      formData.append('accessories', accessories);
      formData.append('addressId', selectedAddressId);
      
      selectedImages.forEach((img) => {
        formData.append('images', img);
      });

      await axiosInstance.post('/ewaste', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Pickup request submitted successfully!');
      navigate('/ewaste');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit pickup request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/ewaste')}
        className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-xs font-semibold cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Hub</span>
      </button>

      {/* Main card */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b pb-4">
          <div className="p-2.5 bg-brand-50 dark:bg-brand-900/20 rounded-xl">
            <Recycle className="w-6 h-6 text-brand-600 dark:text-brand-500" />
          </div>
          <div>
            <h1 className="heading-display text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100">
              Request E-Waste Pickup
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Enter your item details, upload pictures, select your location, and a vendor will visit for physical inspection.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitRequest} className="space-y-6">
          {/* Section 1: Item Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 border-l-4 border-brand-600 pl-2">
              1. Item Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="mobile">Mobile Phone</option>
                  <option value="laptop">Laptop</option>
                  <option value="tablet">Tablet / iPad</option>
                  <option value="tv">Television</option>
                  <option value="audio">Audio Device (Headphones, Speakers)</option>
                  <option value="camera">Camera</option>
                  <option value="other">Other Electronics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">
                  Brand & Model *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple iPhone 13, Dell XPS 15"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">
                  Estimated Age (in months) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 12"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">
                  Available Accessories
                </label>
                <input
                  type="text"
                  placeholder="e.g. Charger, Original Box, Bill, Cable"
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">
                Reported Condition & Faults *
              </label>
              <textarea
                required
                rows="3"
                placeholder="Describe current working status, physical scratches, dents, battery life, or any other details..."
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Section 2: Photos */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 border-l-4 border-brand-600 pl-2">
              2. Upload Photos
            </h3>
            <p className="text-[10px] text-slate-400">Please provide clear photos showing the current condition of your device from multiple angles (Max 5 photos).</p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Add image button */}
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-750 hover:border-brand-650 transition-colors rounded-xl flex flex-col justify-center items-center p-4 cursor-pointer text-slate-400 hover:text-brand-650 aspect-square">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Plus className="w-6 h-6" />
                <span className="text-[10px] mt-1 font-bold">Add Photo</span>
              </label>

              {/* Display selected images */}
              {selectedImages.map((file, index) => (
                <div key={index} className="relative rounded-xl border overflow-hidden aspect-square group shadow-sm bg-slate-50">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeSelectedImage(index)}
                    className="absolute inset-0 bg-black/40 text-white font-bold text-xs flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Pickup Location */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-l-4 border-brand-600 pl-2">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                3. Pickup Address
              </h3>
              <button
                type="button"
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="flex items-center space-x-1 text-[10px] font-bold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{showNewAddressForm ? 'Cancel' : 'Add New Address'}</span>
              </button>
            </div>

            {/* Form to add address */}
            {showNewAddressForm && (
              <div className="p-4 bg-slate-50 dark:bg-dark-950 border rounded-xl space-y-3 animate-fade-in">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">New Address Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Address Label (e.g. Home, Work)"
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={addressCountry}
                    onChange={(e) => setAddressCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded text-xs focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Optional)"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded text-xs focus:outline-none"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addressState}
                    onChange={(e) => setAddressState(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={addressPincode}
                    onChange={(e) => setAddressPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-900 border dark:border-slate-800 rounded text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddNewAddress}
                  disabled={isAddressLoading}
                  className="w-full py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs rounded transition-colors cursor-pointer"
                >
                  {isAddressLoading ? 'Saving...' : 'Save & Select Address'}
                </button>
              </div>
            )}

            {/* List addresses to select */}
            {addresses.length === 0 ? (
              <p className="text-slate-400 text-xs italic">No addresses saved. Please add a pickup address above to proceed.</p>
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
                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-dark-950 px-2 py-0.5 rounded uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[9px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-450 mt-1">
                        {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} — {addr.pincode}, {addr.country}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Submitting Request...
              </>
            ) : (
              'Submit Pickup Request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
