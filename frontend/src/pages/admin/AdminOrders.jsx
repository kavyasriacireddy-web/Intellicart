import React, { useState, useEffect } from 'react';
import { Package, ChevronRight, CheckCircle2, Clock, Filter, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { success, error } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders?status=${statusFilter}&limit=50`);
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        success(`Order status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err) {
      error('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header & Status Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Fulfillment & Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track customer orders and update shipping states in real-time
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-hidden"
          >
            <option value="all">All Orders</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Items & Amount</th>
                <th className="py-4 px-6">Status Updater</th>
                <th className="py-4 px-6 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-6 font-mono font-bold text-slate-900">
                    #{ord._id.slice(-6).toUpperCase()}
                  </td>

                  <td className="py-3 px-6">
                    <p className="font-bold text-slate-900">{ord.user?.name || ord.shippingAddress?.fullName}</p>
                    <p className="text-[10px] text-slate-400">{ord.shippingAddress?.city}, {ord.shippingAddress?.country}</p>
                  </td>

                  <td className="py-3 px-6 text-slate-500">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-6">
                    <p className="font-extrabold text-slate-900">\${Number(ord.totalPrice).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">{ord.orderItems?.length} item(s) • {ord.paymentMethod}</p>
                  </td>

                  <td className="py-3 px-6">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-hidden"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>

                  <td className="py-3 px-6 text-right">
                    <Link
                      to={`/orders/${ord._id}`}
                      className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg inline-flex items-center"
                      title="View Full Order Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
