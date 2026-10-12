import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/common/EmptyState';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, moveToCart, loading } = useWishlist();
  const { success, error } = useToast();

  const products = wishlist?.products || [];

  const handleMoveToCart = async (productId, name) => {
    const res = await moveToCart(productId);
    if (res.success) {
      success(`Moved "${name || 'Product'}" to your cart`);
    } else {
      error(res.message);
    }
  };

  const handleRemove = async (productId) => {
    const res = await removeFromWishlist(productId);
    if (res.success) {
      success('Removed from wishlist');
    }
  };

  if (!loading && products.length === 0) {
    return (
      <EmptyState
        title="Your Wishlist is Empty"
        description="Explore products you love and click the heart icon to save them for later."
        actionText="Discover Products"
        actionLink="/products"
        icon={Heart}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            You have <span className="font-bold text-slate-900">{products.length}</span> saved item(s)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => {
          const id = p._id || p;
          const image = p.images && p.images[0]
            ? p.images[0]
            : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

          return (
            <div
              key={id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-slate-50">
                <Link to={`/product/${id}`}>
                  <img
                    src={image}
                    alt={p.name || 'Product'}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <button
                  onClick={() => handleRemove(id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 text-rose-500 rounded-full hover:bg-rose-50 shadow-xs"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                    {p.brand || p.categoryName}
                  </span>
                  <Link to={`/product/${id}`}>
                    <h3 className="text-xs font-bold text-slate-900 hover:text-brand-600 line-clamp-2">
                      {p.name}
                    </h3>
                  </Link>
                </div>

                <div className="pt-2 border-t border-slate-50 space-y-3">
                  <span className="text-sm font-black text-slate-900">
                    \${Number(p.finalPrice || p.price || 0).toFixed(2)}
                  </span>

                  <button
                    onClick={() => handleMoveToCart(id, p.name)}
                    disabled={p.stock <= 0}
                    className="w-full py-2 px-3 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-40"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{p.stock > 0 ? 'Move to Cart' : 'Out of Stock'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
