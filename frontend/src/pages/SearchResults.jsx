import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeletonGrid } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { trackInteraction } from '../utils/telemetry';
import api from '../services/api';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(query.trim())}&limit=24`);
        if (res.data.success) {
          setProducts(res.data.products || []);
        }

        // Record SEARCH behavioral interaction for AI Recommender
        trackInteraction('SEARCH', null, { query: query.trim() });
      } catch (err) {
        console.error('Search error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs font-medium text-slate-400">
        <Link to="/" className="hover:text-slate-700">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-slate-700">Products</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">Search Results</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Search Results for <span className="text-brand-600">"{query}"</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Found <span className="font-bold text-slate-800">{products.length}</span> matching item(s)
          </p>
        </div>
      </div>

      {loading ? (
        <ProductSkeletonGrid count={8} />
      ) : products.length === 0 ? (
        <EmptyState
          title={`No products matched "${query}"`}
          description="Try searching with different keywords, brand names, or check your spelling."
          actionText="Browse All Products"
          actionLink="/products"
          icon={Search}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} showReason={false} />
          ))}
        </div>
      )}

    </div>
  );
}
