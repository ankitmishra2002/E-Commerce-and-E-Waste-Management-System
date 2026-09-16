import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import axiosInstance from '../../api/axios.js';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Building, FileText, Landmark, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const vendorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessDescription: z.string().optional(),
  gstNumber: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional()
});

export default function VendorRegister() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const navigate = useNavigate();

  const { register, handleSubmit, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(vendorFormSchema)
  });

  const nextStep = async () => {
    // Validate first step fields before advancing
    const isValid = await trigger(['name', 'email', 'password']);
    if (isValid) setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        businessName: data.businessName,
        businessDescription: data.businessDescription || '',
        gstNumber: data.gstNumber || '',
        bankAccountInfo: {
          bankName: data.bankName || '',
          accountNumber: data.accountNumber || '',
          ifscCode: data.ifscCode || ''
        }
      };

      const response = await axiosInstance.post('/auth/vendor/register', payload);
      const { user, token } = response.data.data;
      setCredentials(user, token);
      
      toast.success('Registration successful! Business is pending admin verification.');
      navigate('/vendor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Vendor registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full glass p-8 rounded-2xl border shadow-xl relative overflow-hidden transition-all">
        
        {/* Decorative backdrop gradients */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <h2 className="heading-display text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-600 to-brand-600 dark:from-amber-400 dark:to-brand-400 bg-clip-text text-transparent">
            SparkIT Vendor Hub
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {step === 1 ? 'Step 1: Account Credentials' : 'Step 2: Business Registration Details'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              {/* Owner Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    {...register('name')}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-dark-900/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                      errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                    placeholder="Jane Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    {...register('email')}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-dark-900/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                    placeholder="jane@shop.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`block w-full pl-10 pr-10 py-2.5 bg-white/50 dark:bg-dark-900/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                      errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors cursor-pointer mt-6"
              >
                Continue to Business Info
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Business Name
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    {...register('businessName')}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-dark-900/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                      errors.businessName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                    placeholder="Acme Corporation"
                  />
                </div>
                {errors.businessName && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.businessName.message}</p>
                )}
              </div>

              {/* Business Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Business Description
                </label>
                <textarea
                  {...register('businessDescription')}
                  rows={2}
                  className="block w-full px-3 py-2 bg-white/50 dark:bg-dark-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none text-sm"
                  placeholder="Tell us what you sell..."
                />
              </div>

              {/* GST Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  GSTIN (GST Number)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    {...register('gstNumber')}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-dark-900/50 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm uppercase"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>

              {/* Bank account details */}
              <div className="p-3 bg-slate-100 dark:bg-dark-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                  <Landmark className="w-4 h-4 mr-1.5" />
                  Bank Remittance Info (Optional)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <input
                    type="text"
                    {...register('bankName')}
                    placeholder="Bank Name"
                    className="px-2 py-1.5 text-xs bg-white dark:bg-dark-950 border border-slate-300 dark:border-slate-700 rounded focus:outline-none"
                  />
                  <input
                    type="text"
                    {...register('ifscCode')}
                    placeholder="IFSC Code"
                    className="px-2 py-1.5 text-xs bg-white dark:bg-dark-950 border border-slate-300 dark:border-slate-700 rounded focus:outline-none uppercase"
                  />
                </div>
                <input
                  type="text"
                  {...register('accountNumber')}
                  placeholder="Account Number"
                  className="w-full px-2 py-1.5 text-xs bg-white dark:bg-dark-950 border border-slate-300 dark:border-slate-700 rounded focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 flex justify-center items-center py-3 px-4 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Register
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <span>Already registered? </span>
          <Link to="/vendor/login" className="font-semibold text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
