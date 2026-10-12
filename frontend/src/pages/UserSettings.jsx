import React, { useState } from 'react';
import { User, Phone, MapPin, Lock, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function UserSettings() {
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'India',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setFormError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await updateProfile(payload);
      if (res.success) {
        success('Profile updated successfully!');
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        setFormError(res.message);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details, shipping defaults, and security credentials
        </p>
      </div>

      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        
        {/* Personal Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-brand-600" />
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>Shipping Address Defaults</span>
          </h2>

          <div className="grid grid-cols-1 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="123 Tech Park Blvd"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Bengaluru"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Karnataka"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="560001"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>Security (Leave blank to keep existing password)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
        </button>

      </form>
    </div>
  );
}
