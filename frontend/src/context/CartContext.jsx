import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { trackInteraction } from '../utils/telemetry';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [summary, setSummary] = useState({ itemCount: 0, subtotal: 0, savings: 0, finalTotal: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      setSummary({ itemCount: 0, subtotal: 0, savings: 0, finalTotal: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('[CartContext] Failed to fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      return { success: false, requireAuth: true, message: 'Please log in to add items to cart' };
    }
    try {
      const res = await api.post('/cart', { productId, quantity });
      if (res.data.success) {
        await fetchCart();
        trackInteraction('ADD_TO_CART', productId, { quantity });
        return { success: true, message: 'Added to cart' };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      return { success: false, message: msg };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.put(`/cart/${productId}`, { quantity });
      if (res.data.success) {
        await fetchCart();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update quantity' };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      if (res.data.success) {
        await fetchCart();
        trackInteraction('REMOVE_FROM_CART', productId);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to remove item' };
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart({ items: [] });
      setSummary({ itemCount: 0, subtotal: 0, savings: 0, finalTotal: 0 });
    } catch (err) {
      console.error('[CartContext] Failed to clear cart:', err.message);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        summary,
        loading,
        itemCount: summary.itemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
