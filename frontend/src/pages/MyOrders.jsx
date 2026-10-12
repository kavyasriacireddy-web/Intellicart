import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, XCircle, Clock, CheckCircle } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/myorders');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const res = await api.put(`/orders/${orderId}/cancel`, {
        reason: 'Cancelled by customer from order history',
      });
      if (res.data.success) {
        success('Order cancelled successfully.');
        fetchOrders();
      } else {
        error(res.data.message);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  if (!loading && orders.length === 0) {
    return (
      <EmptyState
        title="No Orders Yet"
        description="You have not placed any orders so far. Explore our personalized catalog to find great deals!"
        actionText="Explore Products"
        actionLink="/products"
        icon={Package}
      />
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SHIPPED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PROCESSING':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Order History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review previous orders, trace status, and manage purchases
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const canCancel = ['PENDING', 'CONFIRMED'].includes(order.orderStatus);

          return (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6 transition-all hover:shadow-md"
            >
              {/* Top Order Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">
                    Order Placed: <span className="font-semibold text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-900">
                    ID: #{order._id}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                  <span className="text-base font-black text-slate-900">
                    \${Number(order.totalPrice).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-2 bg-slate-50 rounded-2xl">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover bg-white"
                    />
                    <div className="truncate text-xs">
                      <p className="font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-slate-500">Qty: {item.quantity} × \${Number(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-500">
                  <span>Shipping Address: {order.shippingAddress?.city}, {order.shippingAddress?.country}</span>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  {canCancel && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="px-4 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl font-semibold transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}

                  <Link
                    to={`/orders/${order._id}`}
                    className="flex-1 sm:flex-initial px-5 py-2 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white rounded-xl font-semibold transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
