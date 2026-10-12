import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  Smartphone,
  MapPin,
  Truck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function Checkout() {
  const { cart, summary, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">Add products before proceeding to checkout.</p>
        <Link to="/products" className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Explore Products
        </Link>
      </div>
    );
  }

  const shippingPrice = summary.finalTotal > 100 ? 0 : 15;
  const taxPrice = Math.round(summary.finalTotal * 0.12 * 100) / 100;
  const grandTotal = Math.round((summary.finalTotal + shippingPrice + taxPrice) * 100) / 100;

  const handleInputChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      setCheckoutError('Please provide complete shipping address details');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        orderItems: items.map((i) => ({
          product: i.product._id || i.product,
          quantity: i.quantity,
        })),
        shippingAddress,
        paymentMethod,
        paymentResult: paymentMethod !== 'COD' ? {
          id: `SIM_TXN_${Date.now()}`,
          status: 'COMPLETED',
          paymentMethodDetail: paymentMethod,
        } : undefined,
      };

      const res = await api.post('/orders', orderPayload);
      if (res.data.success) {
        await clearCart();
        success('Order placed successfully!');
        navigate(`/order-success/${res.data.order._id}`);
      } else {
        setCheckoutError(res.data.message || 'Order failed');
      }
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Checkout & Shipping
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete your order with simulated instant payment or Cash on Delivery
        </p>
      </div>

      {checkoutError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Shipping & Payment Form */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Shipping Address Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-bold text-slate-900">1. Delivery Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Street Address *
              </label>
              <input
                type="text"
                name="address"
                required
                value={shippingAddress.address}
                onChange={handleInputChange}
                placeholder="Flat / House No., Landmark, Street"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  placeholder="Bengaluru"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  placeholder="Karnataka"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PIN Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  placeholder="560001"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">2. Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-brand-600 bg-brand-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-brand-600"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Cash on Delivery</p>
                  <p className="text-[10px] text-slate-500">Pay cash upon delivery</p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-brand-600 bg-brand-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="text-brand-600"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Credit / Debit Card</p>
                  <p className="text-[10px] text-slate-500">Simulated Card Instant Pay</p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-brand-600 bg-brand-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="text-brand-600"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">UPI / QR Payment</p>
                  <p className="text-[10px] text-slate-500">Instant Simulated UPI</p>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Order Summary Checkout Sidebar */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 sticky top-24">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Review ({items.length} items)
          </h2>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
            {items.map((item) => {
              const product = item.product || {};
              const id = product._id || item.product;
              return (
                <div key={id} className="flex items-center space-x-3 text-xs">
                  <img
                    src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover bg-slate-50 shrink-0"
                  />
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                    <p className="text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-slate-900">
                    \${Number((product.finalPrice || item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 text-xs pt-4 border-t border-slate-100">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">\${Number(summary.subtotal).toFixed(2)}</span>
            </div>
            {summary.savings > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Savings</span>
                <span>-\${Number(summary.savings).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Tax (12%)</span>
              <span className="font-semibold text-slate-900">\${taxPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-semibold text-slate-900">
                {shippingPrice === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `\$${shippingPrice.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
              <span>Total Payable</span>
              <span className="text-brand-600">\${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-102 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{submitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-[10px] text-slate-400 text-center space-y-1">
            <p>Academic demonstration transaction simulation.</p>
            <p>Stock will be decremented and telemetry recorded.</p>
          </div>
        </div>

      </form>
    </div>
  );
}
