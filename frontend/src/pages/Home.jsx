import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeletonGrid } from '../components/common/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [recSource, setRecSource] = useState('');

  useEffect(() => {
    // 1. Fetch AI Personalized Recommendations
    const fetchRecommendations = async () => {
      try {
        setLoadingRecs(true);
        const res = await api.get('/recommendations?limit=8');
        if (res.data.success) {
          setRecommendations(res.data.recommendations || []);
          setRecSource(res.data.source || 'HYBRID_ENGINE');
        }
      } catch (err) {
        console.error('Failed to load AI recommendations:', err.message);
      } finally {
        setLoadingRecs(false);
      }
    };

    // 2. Fetch Featured Products & Categories
    const fetchCatalogData = async () => {
      try {
        setLoadingFeatured(true);
        const [prodRes, catRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/categories'),
        ]);

        if (prodRes.data.success) {
          setFeaturedProducts(prodRes.data.products || []);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories || []);
        }
      } catch (err) {
        console.error('Failed to load catalog data:', err.message);
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchRecommendations();
    fetchCatalogData();
  }, [isAuthenticated]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>AI-Powered Precision Recommendations</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Shop Smarter. <br />
              <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                Discover Better.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Experience the future of personalized e-commerce. IntelliCart pairs your unique browsing tastes with machine learning to curate products tailored just for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-102 flex items-center justify-center space-x-2"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/recommendations"
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>See My AI Feed</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-6 text-center lg:text-left">
              <div>
                <p className="text-2xl font-extrabold text-white">50+</p>
                <p className="text-xs text-slate-400 font-medium">Curated Products</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-400">0.4/0.4/0.2</p>
                <p className="text-xs text-slate-400 font-medium">Hybrid Algorithm</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-emerald-400">100%</p>
                <p className="text-xs text-slate-400 font-medium">Real-time Signals</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-indigo-600 rounded-3xl blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">IntelliEngine v1.0</span>
                </div>
                
                <div className="py-6 space-y-4">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-600/30 flex items-center justify-center text-indigo-400 font-bold">
                        AI
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Hybrid Recommendation</p>
                        <p className="text-[10px] text-slate-400">Content + Collaborative + Recency</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">Active</span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/50 space-y-2">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Content Similarity (TF-IDF)</span>
                      <span className="font-mono text-brand-300">40%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-500 h-full rounded-full w-[40%]" />
                    </div>
                    <div className="flex justify-between text-xs text-slate-300 pt-1">
                      <span>Collaborative Filtering (Matrix)</span>
                      <span className="font-mono text-indigo-300">40%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full w-[40%]" />
                    </div>
                    <div className="flex justify-between text-xs text-slate-300 pt-1">
                      <span>Behavioral Intent Score</span>
                      <span className="font-mono text-amber-300">20%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full w-[20%]" />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-center text-slate-400 italic">
                  Recommendations calculated from live MongoDB telemetry
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Free Express Delivery</h4>
              <p className="text-xs text-slate-500">On all orders over \$100</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">AI Personalization</h4>
              <p className="text-xs text-slate-500">Learns your preferences in real-time</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Verified Reviews</h4>
              <p className="text-xs text-slate-500">Only verified buyers can rate</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Easy Returns</h4>
              <p className="text-xs text-slate-500">Hassle-free 30-day policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-sm text-slate-500 mt-1">Explore our diverse product departments</p>
          </div>
          <Link to="/products" className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-4/5 bg-slate-900 flex flex-col justify-end p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 opacity-70 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="relative z-10 text-white">
                <h3 className="font-bold text-sm sm:text-base group-hover:text-brand-300 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-slate-300 font-medium">
                  {cat.itemCount || 0} products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended For You Section (Live AI Backend) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-50/50 via-indigo-50/30 to-purple-50/40 p-6 sm:p-10 rounded-3xl border border-brand-100/60">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider mb-2 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Recommendation Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Recommended For You
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {isAuthenticated
                  ? `Personalized feed generated for ${user?.name || 'you'} using hybrid filtering`
                  : 'Popular trending products curated by our machine learning model'}
              </p>
            </div>
            <Link
              to="/recommendations"
              className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 bg-white px-4 py-2 rounded-xl shadow-xs border border-brand-100"
            >
              <span>Explore AI Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingRecs ? (
            <ProductSkeletonGrid count={4} />
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendations.slice(0, 8).map((product) => (
                <ProductCard key={product.productId || product._id} product={product} showReason={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
              <Sparkles className="w-8 h-8 text-brand-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Curating your recommendations...</p>
              <p className="text-xs text-slate-400">Browse a few items to activate personalized recommendations.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured / Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-sm text-slate-500 mt-1">Top-rated bestsellers across all departments</p>
          </div>
          <Link to="/products" className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingFeatured ? (
          <ProductSkeletonGrid count={8} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((prod) => (
              <ProductCard key={prod._id} product={prod} showReason={false} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
