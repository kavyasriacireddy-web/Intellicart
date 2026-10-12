import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeletonGrid } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { trackInteraction } from '../utils/telemetry';
import api from '../services/api';

export default function CategoryProducts() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const catRes = await api.get(`/categories/${slug}`);
        if (catRes.data.success) {
          const cat = catRes.data.category;
          setCategory(cat);

          // Fetch products in this category
          const prodRes = await api.get(`/products?category=${cat.name}&limit=24`);
          if (prodRes.data.success) {
            setProducts(prodRes.data.products || []);
          }

          // Track CATEGORY_VIEW interaction telemetry
          trackInteraction('CATEGORY_VIEW', null, {
            categoryName: cat.name,
            slug: cat.slug,
          });
        }
      } catch (err) {
        console.error('Error loading category:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs font-medium text-slate-400">
        <Link to="/" className="hover:text-slate-700">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-slate-700">Products</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">{category?.name || slug}</span>
      </nav>

      {/* Category Banner */}
      {category && (
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-12 shadow-lg">
          {category.image && (
            <img
              src={category.image}
              alt={category.name}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          )}
          <div className="relative z-10 space-y-2 max-w-2xl">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              Department
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold">{category.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              {category.description || 'Explore our premier collection of handpicked items.'}
            </p>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <ProductSkeletonGrid count={8} />
      ) : products.length === 0 ? (
        <EmptyState
          title={`No products currently available in ${category?.name || 'this category'}`}
          description="Check back soon as new inventory is regularly stocked."
          actionText="Browse All Products"
          actionLink="/products"
        />
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{products.length}</span> items
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} showReason={false} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
