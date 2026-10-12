import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Package,
  Clock,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Brain,
  Shield,
  Layers,
} from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get('/orders/stats/summary');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            IntelliCart Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 font-light">
            Overview of store transactions, inventory levels, and AI recommendation metrics
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md hover:bg-slate-50 transition-colors"
          >
            Manage Products
          </Link>
          <Link
            to="/admin/analytics"
            className="px-4 py-2 bg-amber-900/40 hover:bg-amber-900/60 border border-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md transition-colors flex items-center space-x-1.5"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>AI Analytics</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Revenue</p>
          <p className="text-2xl font-black text-slate-900">\${Number(stats?.totalRevenue || 0).toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Orders</p>
          <p className="text-2xl font-black text-slate-900">{stats?.totalOrders || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400 font-semibold uppercase">Pending Orders</p>
          <p className="text-2xl font-black text-amber-600">{stats?.pendingOrders || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400 font-semibold uppercase">Registered Users</p>
          <p className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</p>
        </div>
      </div>

      {/* Low Stock Warning & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Low Stock Watch */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low Stock Alerts</span>
            </div>
            <Link to="/admin/products" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Manage Inventory
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.lowStockProducts?.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">All inventory stock levels are healthy.</p>
            ) : (
              stats?.lowStockProducts?.map((item) => (
                <div key={item._id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-slate-50"
                    />
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                      <p className="text-slate-400">{item.categoryName} • \${item.finalPrice}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md font-extrabold text-[11px]">
                    {item.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <Package className="w-4 h-4 text-brand-600" />
              <span>Recent Orders</span>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View All Orders
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentOrders?.map((ord) => (
              <div key={ord._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">
                    #{ord._id.slice(-6).toUpperCase()} • {ord.user?.name || 'Customer'}
                  </p>
                  <p className="text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-extrabold text-slate-900">\${Number(ord.totalPrice).toFixed(2)}</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ord.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.orderStatus === 'CANCELLED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {ord.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
