import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  Search,
  User as UserIcon,
  Sparkles,
  LogOut,
  Package,
  Settings,
  ShieldAlert,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../services/api';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch categories for top navigation dropdown
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        // Silent catch
      }
    };
    fetchCats();
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    setCategoryDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center space-x-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 inline" />
        <span>IntelliCart AI: Shop Smarter. Discover Better. — Free standard shipping on orders over \$100</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-indigo-600 bg-clip-text text-transparent">
                IntelliCart
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-brand-600 -mt-1">
                AI E-Commerce
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg relative items-center mx-4"
          >
            <input
              type="text"
              placeholder="Search laptops, headphones, shoes, books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm rounded-xl border border-transparent focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-hidden text-slate-900 placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-brand-600 transition-colors">
              Home
            </Link>
            <Link to="/products" className="hover:text-brand-600 transition-colors">
              All Products
            </Link>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center space-x-1 hover:text-brand-600 transition-colors"
              >
                <span>Categories</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/category/${cat.slug}`}
                      className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                        {cat.itemCount}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* AI Recommendations Link */}
            <Link
              to="/recommendations"
              className="flex items-center space-x-1.5 text-brand-600 hover:text-brand-700 font-semibold bg-brand-50 hover:bg-brand-100/70 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>For You</span>
            </Link>
          </nav>

          {/* User Actions: Wishlist, Cart, Profile */}
          <div className="flex items-center space-x-3">
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl relative transition-colors"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl relative transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Account / Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 divide-y divide-slate-100">
                    <div className="px-4 py-2.5">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                          ADMINISTRATOR
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Admin portal shortcut */}
                    {isAdmin && (
                      <div className="py-1 bg-amber-50/50">
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2.5 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100/60"
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </div>
                    )}

                    <div className="py-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-brand-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-1.5 rounded-xl shadow-xs transition-all hover:shadow-brand-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 py-4 space-y-4 animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 text-sm rounded-xl outline-hidden focus:ring-2 focus:ring-brand-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </form>

            <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
              <Link to="/" className="p-2 hover:bg-slate-50 rounded-lg">Home</Link>
              <Link to="/products" className="p-2 hover:bg-slate-50 rounded-lg">All Products</Link>
              <Link to="/recommendations" className="p-2 bg-brand-50 text-brand-600 rounded-lg font-semibold flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>AI Recommendations</span>
              </Link>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Categories</p>
                {categories.map((c) => (
                  <Link key={c._id} to={`/category/${c.slug}`} className="block px-2 py-1 text-slate-600 text-xs">
                    {c.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
