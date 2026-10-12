import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { fetchCart } = useCart();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist({ products: [] });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setWishlist(res.data.wishlist);
      }
    } catch (err) {
      console.error('[WishlistContext] Failed to fetch wishlist:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const isInWishlist = (productId) => {
    if (!wishlist?.products) return false;
    return wishlist.products.some((p) => (p._id || p) === productId);
  };

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      return { success: false, requireAuth: true, message: 'Please log in to add items to wishlist' };
    }
    try {
      const res = await api.post('/wishlist', { productId });
      if (res.data.success) {
        await fetchWishlist();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update wishlist' };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data.success) {
        await fetchWishlist();
        return { success: true, message: 'Removed from wishlist' };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to remove' };
    }
  };

  const moveToCart = async (productId) => {
    try {
      const res = await api.post(`/wishlist/${productId}/move-to-cart`);
      if (res.data.success) {
        await fetchWishlist();
        await fetchCart();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to move to cart' };
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist?.products?.length || 0,
        loading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
