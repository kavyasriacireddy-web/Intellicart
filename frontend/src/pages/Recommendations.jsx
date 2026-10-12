import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Brain,
  Cpu,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeletonGrid } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function Recommendations() {
  const { user, isAuthenticated } = useAuth();
  const { success, info } = useToast();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showExplanation, setShowExplanation] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recommendations?limit=16');
      if (res.data.success) {
        setRecommendations(res.data.recommendations || []);
        setSource(res.data.source || 'AI_HYBRID_ENGINE');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    await fetchRecommendations();
    success('AI recommendation feed refreshed with latest behavioral signals!');
  };

  const categories = ['all', ...new Set(recommendations.map((r) => r.categoryName).filter(Boolean))];

  const filteredRecommendations = selectedCategory === 'all'
    ? recommendations
    : recommendations.filter((r) => r.categoryName === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* AI Discovery Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>AI Discovery Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Curated Specifically for {isAuthenticated ? user?.name : 'You'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            Our hybrid recommendation engine computes TF-IDF content similarity, item-based collaborative patterns, and your real-time interaction telemetry to deliver intelligent product recommendations.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-md transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Feed</span>
            </button>

            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md transition-colors flex items-center space-x-1.5"
            >
              <Info className="w-3.5 h-3.5 text-brand-300" />
              <span>{showExplanation ? 'Hide Algorithm Details' : 'How Recommendations Work'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Architecture & Algorithm Explainer */}
      {showExplanation && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-md space-y-6 animate-fade-in">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Brain className="w-5 h-5 text-brand-600" />
            <span>Hybrid Recommendation Scoring Algorithm</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs">
                  40%
                </span>
                <span>Content-Based Similarity</span>
              </div>
              <p>
                Extracts product title, category, description, and specifications into text vectors. Measures cosine similarity using scikit-learn's TF-IDF Vectorizer.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                  40%
                </span>
                <span>Collaborative Filtering</span>
              </div>
              <p>
                Builds a sparse user-item interaction matrix weighted by user actions (Views=1, Carts=4, Purchases=5). Predicts ratings using item-item similarity.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
                  20%
                </span>
                <span>Behavioral Intent & Recency</span>
              </div>
              <p>
                Applies real-time category affinities, boosts unpurchased candidate items, and filters out already purchased or out-of-stock items.
              </p>
            </div>
          </div>

          <div className="p-3 bg-brand-50/50 rounded-xl text-[11px] text-brand-800 font-mono text-center">
            finalScore = 0.40 × contentScore + 0.40 × collaborativeScore + 0.20 × behaviorScore
          </div>
        </div>
      )}

      {/* Category Tabs */}
      {categories.length > 2 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All Recommendations' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Recommendations Grid */}
      {loading ? (
        <ProductSkeletonGrid count={8} />
      ) : filteredRecommendations.length === 0 ? (
        <EmptyState
          title="No recommendations for this category"
          description="Browse items to help our engine calculate personalized suggestions."
          actionText="Explore Products"
          actionLink="/products"
          icon={Sparkles}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Engine Source:{' '}
              <span className="font-mono font-bold text-slate-800 uppercase">{source}</span>
            </span>
            <span>{filteredRecommendations.length} tailored recommendations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRecommendations.map((product) => (
              <ProductCard
                key={product.productId || product._id}
                product={product}
                showReason={true}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
