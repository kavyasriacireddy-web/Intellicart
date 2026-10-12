import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Package,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error } = useToast();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    name: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    price: '',
    discount: 0,
    stock: 10,
    images: '',
    tags: '',
    isFeatured: false,
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/categories'),
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.products || []);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    if (categories.length > 0) {
      setFormData((prev) => ({ ...prev, category: categories[0]._id }));
    }
    setIsEditing(false);
    setEditingId(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setFormData({
      name: p.name,
      description: p.description,
      category: p.category?._id || p.category || '',
      subcategory: p.subcategory || '',
      brand: p.brand,
      price: p.price,
      discount: p.discount || 0,
      stock: p.stock,
      images: p.images ? p.images.join(', ') : '',
      tags: p.tags ? p.tags.join(', ') : '',
      isFeatured: Boolean(p.isFeatured),
    });
    setIsEditing(true);
    setEditingId(p._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discount: Number(formData.discount),
        stock: Number(formData.stock),
        images: formData.images ? formData.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
        tags: formData.tags ? formData.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      if (isEditing) {
        const res = await api.put(`/products/${editingId}`, payload);
        if (res.data.success) {
          success('Product updated successfully');
          setModalOpen(false);
          fetchProducts();
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.data.success) {
          success('Product created successfully');
          setModalOpen(false);
          fetchProducts();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        success('Product deleted successfully');
        fetchProducts();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleStockUpdate = async (id, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      const res = await api.put(`/products/${id}`, { stock: newStock });
      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, stock: newStock } : p))
        );
      }
    } catch (err) {
      error('Failed to update stock');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, edit, restock, or remove catalog items
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by title, brand, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {filtered.length} products listed
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price / Discount</th>
                <th className="py-4 px-6">Stock Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-slate-50 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1 max-w-xs">{p.name}</p>
                        <p className="text-[10px] text-brand-600 font-semibold uppercase">{p.brand}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-6 text-slate-600 font-medium">
                    {p.categoryName}
                  </td>

                  <td className="py-3 px-6">
                    <p className="font-extrabold text-slate-900">\${p.finalPrice}</p>
                    {p.discount > 0 && (
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        {p.discount}% off (\${p.price})
                      </p>
                    )}
                  </td>

                  <td className="py-3 px-6">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.stock > 10
                            ? 'bg-emerald-50 text-emerald-700'
                            : p.stock > 0
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {p.stock} units
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleStockUpdate(p._id, p.stock, -5)}
                          className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-sm text-[10px] font-bold"
                          title="Reduce stock by 5"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleStockUpdate(p._id, p.stock, 10)}
                          className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-sm text-[10px] font-bold"
                          title="Add stock by 10"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id, p.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit Product */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Price (\$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Stock Units *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Image URLs (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tags (comma-separated, for TF-IDF content filtering)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="laptop, programming, apple"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded-sm text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="isFeatured" className="font-semibold text-slate-800">
                  Feature on Home Page showcase
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold shadow-md"
                >
                  {isEditing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
