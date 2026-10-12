import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Heart,
  ShoppingCart,
  Sparkles,
  Shield,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';

export default function UserProfile() {
  const { user, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [ordersCount, setOrdersCount] = useState(0);
  const [recentInteractions, setRecentInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [ordersRes, interactRes] = await Promise.all([
          api.get('/orders/myorders'),
          api.get('/interactions/my'),
        ]);

        if (ordersRes.data.success) {
          setOrdersCount(ordersRes.data.count || 0);
        }
        if (interactRes.data.success) {
          setRecentInteractions(interactRes.data.interactions || []);
        }
      } catch (err) {
        console.error('Error loading profile activity:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Profile Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand-600 border-4 border-white/20 text-white flex items-center justify-center font-extrabold text-3xl shadow-xl">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold">{user?.name}</h1>
              {isAdmin && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center justify-center sm:justify-start space-x-2">
              <Mail className="w-4 h-4 text-brand-400" />
              <span>{user?.email}</span>
            </p>
            {user?.phone && (
              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start space-x-2">
                <Phone className="w-3.5 h-3.5" />
                <span>{user.phone}</span>
              </p>
            )}
          </div>

          <Link
            to="/settings"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md transition-colors"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          to="/orders"
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Orders</p>
            <p className="text-xl font-extrabold text-slate-900">{ordersCount}</p>
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Wishlist</p>
            <p className="text-xl font-extrabold text-slate-900">{wishlistCount}</p>
          </div>
        </Link>

        <Link
          to="/cart"
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">In Cart</p>
            <p className="text-xl font-extrabold text-slate-900">{itemCount}</p>
          </div>
        </Link>

        <Link
          to="/recommendations"
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">AI Affinity</p>
            <p className="text-xl font-extrabold text-emerald-600">Active</p>
          </div>
        </Link>
      </div>

      {/* Address & Recent Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Shipping Address info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
            <MapPin className="w-5 h-5 text-brand-600" />
            <h3>Default Shipping Address</h3>
          </div>

          <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="font-bold text-slate-900">{user?.name}</p>
            <p>{user?.address?.street || 'No street specified'}</p>
            <p>
              {user?.address?.city || 'Bengaluru'}, {user?.address?.state || 'Karnataka'} {user?.address?.postalCode || ''}
            </p>
            <p>{user?.address?.country || 'India'}</p>
            <p className="pt-2 text-slate-400">Phone: {user?.phone || 'Not provided'}</p>
          </div>

          <Link
            to="/settings"
            className="block text-center py-2 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 rounded-xl"
          >
            Update Address
          </Link>
        </div>

        {/* Behavioral Telemetry Log */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h3>Recent Recommendation Signals</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Logged in MongoDB</span>
          </div>

          {recentInteractions.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No recent interactions recorded yet. Browse products to train your AI model.
            </p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {recentInteractions.slice(0, 8).map((it) => (
                <div
                  key={it._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        it.action === 'PURCHASE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : it.action === 'ADD_TO_CART'
                          ? 'bg-blue-100 text-blue-800'
                          : it.action === 'WISHLIST'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {it.action}
                    </span>
                    <span className="text-slate-800 font-medium truncate">
                      {it.productId?.name || it.metadata?.query || it.metadata?.categoryName || 'Item'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    weight: {it.weight}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
