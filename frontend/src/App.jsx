import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// 18 User Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import UserProfile from './pages/UserProfile';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import SearchResults from './pages/SearchResults';
import CategoryProducts from './pages/CategoryProducts';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Recommendations from './pages/Recommendations';
import UserSettings from './pages/UserSettings';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminAnalytics from './pages/admin/AdminAnalytics';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
                <Navbar />

                <main className="flex-1">
                  <Routes>
                    {/* 1. Home */}
                    <Route path="/" element={<Home />} />

                    {/* 2. Register */}
                    <Route path="/register" element={<Register />} />

                    {/* 3. Login */}
                    <Route path="/login" element={<Login />} />

                    {/* 4. Forgot Password */}
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* 5. User Profile */}
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <UserProfile />
                        </ProtectedRoute>
                      }
                    />

                    {/* 6. Products Catalog */}
                    <Route path="/products" element={<Products />} />

                    {/* 7. Product Details */}
                    <Route path="/product/:id" element={<ProductDetails />} />

                    {/* 8. Search Results */}
                    <Route path="/search" element={<SearchResults />} />

                    {/* 9. Category Products */}
                    <Route path="/category/:slug" element={<CategoryProducts />} />

                    {/* 10. Cart */}
                    <Route path="/cart" element={<Cart />} />

                    {/* 11. Wishlist */}
                    <Route
                      path="/wishlist"
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />

                    {/* 12. Checkout */}
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />

                    {/* 13. Order Confirmation */}
                    <Route
                      path="/order-success/:id"
                      element={
                        <ProtectedRoute>
                          <OrderConfirmation />
                        </ProtectedRoute>
                      }
                    />

                    {/* 14. My Orders */}
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <MyOrders />
                        </ProtectedRoute>
                      }
                    />

                    {/* 15. Order Details */}
                    <Route
                      path="/orders/:id"
                      element={
                        <ProtectedRoute>
                          <OrderDetails />
                        </ProtectedRoute>
                      }
                    />

                    {/* 16. Recommendations (AI Discovery Hub) */}
                    <Route path="/recommendations" element={<Recommendations />} />

                    {/* 17. User Settings */}
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <UserSettings />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Portal Routes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/products"
                      element={
                        <AdminRoute>
                          <AdminProducts />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <AdminRoute>
                          <AdminOrders />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <AdminRoute>
                          <AdminUsers />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/categories"
                      element={
                        <AdminRoute>
                          <AdminCategories />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/analytics"
                      element={
                        <AdminRoute>
                          <AdminAnalytics />
                        </AdminRoute>
                      }
                    />

                    {/* 18. 404 Not Found Catch-All */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>

                <Footer />
              </div>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
