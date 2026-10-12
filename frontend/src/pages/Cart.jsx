import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/common/EmptyState';

export default function Cart() {
  const { cart, summary, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const items = cart?.items || [];

  const handleUpdateQty = async (productId, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > maxStock) {
      error(`Maximum available stock is ${maxStock} units.`);
      return;
    }
    const res = await updateQuantity(productId, newQty);
    if (!res.success) {
      error(res.message);
    }
  };

  const handleRemove = async (productId) => {
    const res = await removeFromCart(productId);
    if (res.success) {
      success('Item removed from cart');
    }
  };

  if (!loading && items.length === 0) {
    return (
      <EmptyState
        title="Your Cart is Empty"
        description="Looks like you haven't added anything to your cart yet. Discover trending products with AI personalized recommendations!"
        actionText="Start Shopping"
        actionLink="/products"
        icon={ShoppingBag}
      />
    );
  }

  // Shipping calculation
  const freeShippingThreshold = 100;
  const progressPercent = Math.min(100, Math.round((summary.finalTotal / freeShippingThreshold) * 100));
  const diffToFree = Math.max(0, freeShippingThreshold - summary.finalTotal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            You have <span className="font-bold text-slate-900">{summary.itemCount}</span> items in your cart
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Free Shipping Alert Bar */}
          <div className="p-4 bg-brand-50/80 border border-brand-100 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-brand-900">
              <span className="flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-brand-600" />
                {diffToFree === 0 ? (
                  <span className="text-emerald-700 font-bold">🎉 Congratulations! You unlocked Free Shipping!</span>
                ) : (
                  <span>Add \${diffToFree.toFixed(2)} more to qualify for FREE Shipping</span>
                )}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-brand-200/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {items.map((item) => {
            const product = item.product || {};
            const pId = product._id || item.product;
            const stock = product.stock || 10;
            const itemPrice = product.finalPrice || item.price;

            return (
              <div
                key={pId}
                className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-4 transition-all"
              >
                {/* Product Image */}
                <Link to={`/product/${pId}`} className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                  <img
                    src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                    {product.brand || product.categoryName}
                  </span>
                  <Link to={`/product/${pId}`}>
                    <h3 className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
                      {product.name || 'Product'}
                    </h3>
                  </Link>
                  <p className="text-xs font-black text-slate-800 mt-1">
                    \${Number(itemPrice).toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => handleUpdateQty(pId, item.quantity, -1, stock)}
                    disabled={item.quantity <= 1}
                    className="p-2 text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-30"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQty(pId, item.quantity, 1, stock)}
                    disabled={item.quantity >= stock}
                    className="p-2 text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className="text-sm font-extrabold text-slate-900">
                    \${Number(itemPrice * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleRemove(pId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 sticky top-24">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({summary.itemCount} items)</span>
              <span className="font-semibold text-slate-900">\${Number(summary.subtotal).toFixed(2)}</span>
            </div>

            {summary.savings > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount Savings</span>
                <span>-\${Number(summary.savings).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (12%)</span>
              <span className="font-semibold text-slate-900">
                \${Number(summary.finalTotal * 0.12).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-semibold text-slate-900">
                {diffToFree === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : '\$15.00'}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Amount</span>
              <span className="text-brand-600">
                \${Number(summary.finalTotal + (diffToFree === 0 ? 0 : 15) + summary.finalTotal * 0.12).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-102 flex items-center justify-center space-x-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Simulated Secure 256-bit Checkout</span>
          </div>
        </div>

      </div>

    </div>
  );
}
