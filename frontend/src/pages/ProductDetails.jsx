import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Check,
  ChevronRight,
  Plus,
  Minus,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ProductDetailsSkeleton } from '../components/common/LoadingSkeleton';
import ProductCard from '../components/common/ProductCard';
import { trackInteraction } from '../utils/telemetry';
import api from '../services/api';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const { success, error, info } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
          setReviews(res.data.reviews || []);
          setActiveImageIndex(0);
          setQuantity(1);

          // Track behavioral interaction: PRODUCT_VIEW
          trackInteraction('PRODUCT_VIEW', res.data.product._id, {
            categoryName: res.data.product.categoryName,
            brand: res.data.product.brand,
          });

          // Fetch AI Similar Products (Content-Based)
          try {
            const aiRes = await api.get(`/recommendations/product/${res.data.product._id}?limit=4`);
            if (aiRes.data.success) {
              setSimilarProducts(aiRes.data.recommendations || []);
            }
          } catch (e) {
            setSimilarProducts(res.data.relatedProducts || []);
          }
        }
      } catch (err) {
        console.error('Error loading product details:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">The requested product does not exist or was removed.</p>
        <Link to="/products" className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id);
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'];

  const discount = product.discount || 0;
  const originalPrice = product.price;
  const finalPrice = product.finalPrice || (discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice);

  const handleAddToCart = async () => {
    if (product.stock < 1) {
      error('Product is out of stock.');
      return;
    }
    setAddingToCart(true);
    const res = await addToCart(product._id, quantity);
    setAddingToCart(false);

    if (res.requireAuth) {
      info('Please sign in to add items to your cart.');
    } else if (res.success) {
      success(`Added ${quantity} unit(s) of "${product.name.slice(0, 25)}..." to cart.`);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } else {
      error(res.message || 'Failed to add item to cart.');
    }
  };

  const handleToggleWishlist = async () => {
    if (isWishlisted) {
      const res = await removeFromWishlist(product._id);
      if (res.success) success('Removed from wishlist');
    } else {
      const res = await addToWishlist(product._id);
      if (res.requireAuth) {
        info('Please sign in to save items to your wishlist.');
      } else if (res.success) {
        success('Saved to wishlist');
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      info('Please sign in to submit a review.');
      return;
    }

    setReviewError('');
    setSubmittingReview(true);
    try {
      const res = await api.post(`/reviews/product/${product._id}`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      if (res.data.success) {
        success('Thank you! Your verified review has been posted.');
        setReviews([res.data.review, ...reviews]);
        setReviewTitle('');
        setReviewComment('');
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-medium text-slate-400">
        <Link to="/" className="hover:text-slate-700">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-slate-700">Products</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/category/${product.category?.slug || product.categoryName?.toLowerCase()}`} className="hover:text-slate-700">
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase: Images + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-md">
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm">
                {discount}% OFF
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-brand-600 shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
                {product.brand}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center space-x-3 mt-3">
              <div className="flex items-center space-x-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.rating || 4.5) ? 'fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-900">
                {product.rating ? Number(product.rating).toFixed(1) : '4.5'}
              </span>
              <span className="text-xs text-slate-400">
                ({product.numReviews || reviews.length} customer reviews)
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline space-x-3">
            <span className="text-3xl font-black text-slate-900">
              \${Number(finalPrice).toFixed(2)}
            </span>
            {discount > 0 && (
              <span className="text-sm text-slate-400 line-through">
                \${Number(originalPrice).toFixed(2)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                Save \${Number(originalPrice - finalPrice).toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 leading-relaxed font-light">
            {product.description}
          </p>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-2 text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || addingToCart}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-2 ${
                  justAdded
                    ? 'bg-emerald-600 text-white'
                    : product.stock <= 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30 hover:scale-102'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-xl border transition-all ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-brand-600" />
              <span>Fast Shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>1 Year Warranty</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>30-Day Returns</span>
            </div>
          </div>

        </div>

      </div>

      {/* Specifications Table */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.specifications).map(([key, val]) => (
              <div key={key} className="flex justify-between py-2 border-b border-slate-100 text-xs">
                <span className="font-semibold text-slate-500">{key}</span>
                <span className="text-slate-900 font-medium text-right">{val}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Content-Based Similar Products (AI TF-IDF shelf) */}
      {similarProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1.5 text-brand-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>TF-IDF Content Similarity</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Similar Products You May Like
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.productId || p._id} product={p} showReason={true} />
            ))}
          </div>
        </section>
      )}

      {/* Verified Reviews Section */}
      <section className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Customer Reviews</h2>
            <p className="text-xs text-slate-500 mt-1">
              Verified feedback from authenticated buyers
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {product.rating ? Number(product.rating).toFixed(1) : '4.5'}
            </span>
            <div className="text-xs text-slate-500">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span>{reviews.length} reviews</span>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <span>Write a Verified Review</span>
          </h3>

          {reviewError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{reviewError}</span>
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-slate-700">Your Rating:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setReviewRating(s)}
                    className="p-1 text-slate-300 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        s <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Headline / Summary (e.g. Incredible battery life!)"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full px-4 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-hidden focus:border-brand-500"
            />

            <textarea
              required
              rows={3}
              placeholder="Share details of your experience with this item..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full px-4 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-hidden focus:border-brand-500"
            />

            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">
              No reviews written yet. Be the first verified buyer to share your feedback!
            </p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="p-4 rounded-2xl bg-white border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-800">{r.userName}</span>
                    {r.isVerifiedPurchase && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= r.rating ? 'fill-current' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                {r.title && <h4 className="text-xs font-bold text-slate-900">{r.title}</h4>}
                <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
