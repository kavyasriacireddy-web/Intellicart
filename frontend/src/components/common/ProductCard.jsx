import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Sparkles, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';

export default function ProductCard({ product, showReason = true }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { success, error, info } = useToast();

  const [addingCart, setAddingCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const id = product._id || product.productId;
  const isWishlisted = isInWishlist(id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock < 1) {
      error('Sorry, this product is out of stock.');
      return;
    }

    setAddingCart(true);
    const res = await addToCart(id, 1);
    setAddingCart(false);

    if (res.requireAuth) {
      info('Please sign in to add products to your cart.');
    } else if (res.success) {
      success(`Added "${product.name.slice(0, 25)}..." to your cart.`);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } else {
      error(res.message || 'Failed to add item to cart.');
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlisted) {
      const res = await removeFromWishlist(id);
      if (res.success) success('Removed from wishlist');
    } else {
      const res = await addToWishlist(id);
      if (res.requireAuth) {
        info('Please sign in to add products to your wishlist.');
      } else if (res.success) {
        success('Saved to your wishlist');
      }
    }
  };

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

  const discount = product.discount || 0;
  const originalPrice = product.price;
  const finalPrice = product.finalPrice || (discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Top badges: Discount & AI reason */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {discount > 0 && (
          <span className="px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase bg-emerald-500 text-white rounded-md shadow-xs">
            {discount}% OFF
          </span>
        )}
        {showReason && product.reason && (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-50/95 text-brand-700 border border-brand-200/60 rounded-md backdrop-blur-xs flex items-center space-x-1 shadow-2xs">
            <Sparkles className="w-3 h-3 text-brand-600 inline" />
            <span className="truncate max-w-[150px]">{product.reason}</span>
          </span>
        )}
      </div>

      {/* Wishlist toggle button */}
      <button
        onClick={handleToggleWishlist}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
          isWishlisted
            ? 'bg-rose-50 text-rose-500 shadow-sm'
            : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-2xs'
        }`}
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Product Image */}
      <Link to={`/product/${id}`} className="block relative aspect-4/3 overflow-hidden bg-slate-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-brand-600 text-[10px]">
              {product.brand || product.categoryName}
            </span>
            <div className="flex items-center space-x-1 text-slate-700">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-bold text-xs">{product.rating ? Number(product.rating).toFixed(1) : '4.5'}</span>
              {product.numReviews > 0 && (
                <span className="text-slate-400 text-[11px]">({product.numReviews})</span>
              )}
            </div>
          </div>

          <Link to={`/product/${id}`} className="block group-hover:text-brand-600 transition-colors">
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base font-extrabold text-slate-900">
                \${Number(finalPrice).toFixed(2)}
              </span>
              {discount > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  \${Number(originalPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || addingCart}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : product.stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white hover:shadow-md hover:shadow-brand-500/20'
            }`}
            title="Add to Cart"
          >
            {justAdded ? (
              <Check className="w-4 h-4 animate-scale-up" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
