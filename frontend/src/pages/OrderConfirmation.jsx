import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, MapPin, ArrowRight, ShoppingBag } from 'lucide-react';
import api from '../services/api';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Error loading order confirmation:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Order ID: <span className="font-mono font-bold text-slate-900">#{id}</span>
        </p>
        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
          Status: {order?.orderStatus || 'CONFIRMED'}
        </span>
      </div>

      {order && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Package className="w-4 h-4 text-brand-600" />
              <span>Items in this shipment</span>
            </h2>
            <span className="text-xs text-slate-400">
              {order.orderItems?.length} product(s)
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {order.orderItems?.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-50"
                  />
                  <div>
                    <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                    <p className="text-slate-400">Qty: {item.quantity} × \${Number(item.price).toFixed(2)}</p>
                  </div>
                </div>
                <span className="font-extrabold text-slate-900">
                  \${Number(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
              <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>Shipping To</span>
              </p>
              <p className="text-slate-600">{order.shippingAddress?.fullName}</p>
              <p className="text-slate-600">{order.shippingAddress?.address}</p>
              <p className="text-slate-600">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5">
              <p className="font-bold text-slate-900">Payment & Pricing</p>
              <div className="flex justify-between text-slate-600">
                <span>Method</span>
                <span className="font-semibold">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1 border-t border-slate-200">
                <span>Total Paid</span>
                <span className="text-brand-600">\${Number(order.totalPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Link
          to="/orders"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2"
        >
          <span>View All Orders</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/products"
          className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 flex items-center justify-center space-x-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

    </div>
  );
}
