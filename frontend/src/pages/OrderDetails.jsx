import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error('Error fetching order:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const res = await api.put(`/orders/${id}/cancel`, {
        reason: 'Customer requested cancellation from order details page',
      });
      if (res.data.success) {
        success('Order cancelled');
        fetchOrder();
      } else {
        error(res.data.message);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <Link to="/orders" className="text-xs font-semibold text-brand-600 mt-4 inline-block">
          Return to My Orders
        </Link>
      </div>
    );
  }

  const steps = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = steps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'CANCELLED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link to="/orders" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order #{order._id}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {['PENDING', 'CONFIRMED'].includes(order.orderStatus) && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Progress Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          Order Status Lifecycle
        </h3>

        {isCancelled ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">This order was cancelled</p>
              <p className="text-rose-600 mt-0.5">
                {order.cancellationReason || 'Cancelled by customer'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {steps.map((st, i) => {
              const completed = currentStepIndex >= i;
              const isCurrent = currentStepIndex === i;

              return (
                <div key={st} className="space-y-2">
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      completed
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {completed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <p
                    className={`text-[11px] font-bold ${
                      isCurrent ? 'text-brand-600' : completed ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {st}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Items List */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Items
          </h2>

          <div className="divide-y divide-slate-100">
            {order.orderItems?.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover bg-slate-50"
                  />
                  <div>
                    <Link
                      to={`/product/${item.product?._id || item.product}`}
                      className="font-bold text-slate-900 hover:text-brand-600"
                    >
                      {item.name}
                    </Link>
                    <p className="text-slate-400 mt-0.5">
                      Qty: {item.quantity} × \${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className="font-extrabold text-slate-900 text-sm">
                  \${Number(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Total</span>
              <span className="font-bold text-slate-900">\${Number(order.itemsPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (12%)</span>
              <span className="font-bold text-slate-900">\${Number(order.taxPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-bold text-slate-900">\${Number(order.shippingPrice).toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
              <span>Grand Total</span>
              <span className="text-brand-600">\${Number(order.totalPrice).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Shipping Information</span>
            </h3>
            <div className="space-y-1 text-slate-600 bg-slate-50 p-4 rounded-2xl">
              <p className="font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country}</p>
              <p className="pt-1 text-slate-400">Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Payment Details</span>
            </h3>
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl">
              <div className="flex justify-between text-slate-600">
                <span>Method</span>
                <span className="font-bold text-slate-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Status</span>
                <span className={`font-bold ${order.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order.isPaid ? 'PAID' : 'PENDING'}
                </span>
              </div>
              {order.paymentResult?.id && (
                <div className="flex justify-between text-slate-600">
                  <span>Txn ID</span>
                  <span className="font-mono text-[10px]">{order.paymentResult.id}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
