import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { useUserAuth } from './UserAuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useUserAuth();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart_items');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => String(i.product.id) === String(product.id));
      if (existing) {
        return prev.map(i => String(i.product.id) === String(product.id) ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { id: Date.now(), product, quantity }];
    });
    setOpen(true);
  };

  const updateQuantity = (itemId, newQty) => {
    setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(1, newQty) } : i));
  };

  const removeItem = (itemId) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = () => setCartItems([]);

  useEffect(() => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // When user logs in, load remote cart and merge with local
  useEffect(() => {
    let mounted = true;

    const syncCart = async () => {
      if (!isAuthenticated || !user) {
        // User logged out - keep local cart as is
        return;
      }

      try {
        const { data, error } = await supabase
          .from('carts')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.warn('Erreur lecture panier supabase:', error.message || error);
          return;
        }

        const remoteItems = data?.items || [];
        
        // Only merge if remote cart exists and is not empty
        if (remoteItems.length > 0) {
          const local = cartItems;
          const map = new Map();
          
          // Local items take priority
          (local || []).forEach(item => {
            const key = String(item.product.id);
            map.set(key, { ...item });
          });
          
          // Remote items - only add if not in local cart
          (remoteItems || []).forEach(item => {
            const key = String(item.product.id);
            if (!map.has(key)) {
              map.set(key, { ...item });
            }
          });
          
          const merged = Array.from(map.values());
          if (mounted && JSON.stringify(merged) !== JSON.stringify(local)) {
            setCartItems(merged);
          }
        }
      } catch (err) {
        console.warn('Erreur sync panier:', err.message || err);
      }
    };

    syncCart();

    return () => { mounted = false; };
  }, [isAuthenticated, user]);

  // Sync cart to Supabase when it changes and user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    let cancelled = false;
    const save = async () => {
      try {
        await supabase.from('carts').upsert({ user_id: user.id, items: cartItems }, { returning: 'minimal' });
      } catch (err) {
        if (!cancelled) console.warn('Erreur sauvegarde panier supabase:', err.message || err);
      }
    };
    
    // Delay slightly to prevent immediate re-sync
    const timeout = setTimeout(save, 300);
    return () => { 
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [cartItems, isAuthenticated, user]);

  return (
    <CartContext.Provider value={{ cartItems, open, setOpen, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
