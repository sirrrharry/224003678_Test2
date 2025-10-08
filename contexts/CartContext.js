import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase';
import { ref, onValue, runTransaction, update, remove, set, get } from 'firebase/database';
import { AuthContext } from './AuthContext';

export const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: {} });
  const [loading, setLoading] = useState(true);


  const persistLocal = async (uId, cartData) => {
    try {
      if (!uId) return;
      await AsyncStorage.setItem(`@cart:${uId}`, JSON.stringify(cartData));
    } catch (e) {
      console.warn('Failed to save cart locally', e);
    }
  };

  const loadLocal = async (uId) => {
    try {
      if (!uId) return null;
      const s = await AsyncStorage.getItem(`@cart:${uId}`);
      return s ? JSON.parse(s) : null;
    } catch (e) {
      console.warn('Failed to load local cart', e);
      return null;
    }
  };

  useEffect(() => {
    let unsubscribe = null;
    const start = async () => {
      if (!user) {
        setCart({ items: {} });
        setLoading(false);
        return;
      }

      const uId = user.uid;
      const cartRef = ref(db, `carts/${uId}`);

    
      const local = await loadLocal(uId);
      if (local) setCart(local);

      unsubscribe = onValue(
        cartRef,
        (snap) => {
          const val = snap.val();
          const data = val || { items: {} };
          console.log('[Cart] remote cart updated', data);
          setCart(data);
          persistLocal(uId, data);
          setLoading(false);
        },
        (err) => {
          console.warn('Cart listener error', err);
          setLoading(false);
        }
      );
    };

    start();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const addToCart = async (product, qty = 1) => {
    if (!user) throw new Error('Not authenticated');
    const itemRef = ref(db, `carts/${user.uid}/items/${product.id}`);
   
    const prevCart = cart || { items: {} };
    const prevItems = prevCart.items ? { ...prevCart.items } : {};

    
    const existing = prevItems[product.id];
    const optimisticItems = { ...prevItems };
    if (!existing) {
      optimisticItems[product.id] = { id: product.id, title: product.title, price: product.price, image: product.image, quantity: qty };
    } else {
      optimisticItems[product.id] = { ...existing, quantity: (existing.quantity || 0) + qty };
    }

    const optimisticCart = { ...prevCart, items: optimisticItems };
    try {
      setCart(optimisticCart);
      await persistLocal(user.uid, optimisticCart);
    } catch (e) {
      console.warn('[Cart] optimistic local persist failed', e);
    }


    try {
      const result = await runTransaction(itemRef, (current) => {
        if (current === null) {
          return { id: product.id, title: product.title, price: product.price, image: product.image, quantity: qty };
        } else {
          return { ...current, quantity: (current.quantity || 0) + qty };
        }
      });

      if (result && result.committed) {
        console.log('[Cart] addToCart transaction committed for', product.id);
        return result;
      }

      console.warn('[Cart] addToCart transaction did not commit, falling back to get/set', result);
    } catch (txErr) {
      console.warn('[Cart] addToCart transaction failed, falling back to get/set', txErr);
    }

    
    try {
      const snap = await get(itemRef);
      const current = snap.exists() ? snap.val() : null;
      if (!current) {
        await set(itemRef, { id: product.id, title: product.title, price: product.price, image: product.image, quantity: (optimisticItems[product.id].quantity || qty) });
        console.log('[Cart] addToCart set new item', product.id);
      } else {
        const newQty = (current.quantity || 0) + qty;
        await update(itemRef, { quantity: newQty });
        console.log('[Cart] addToCart updated quantity for', product.id, newQty);
      }
      return { committed: true };
    } catch (e) {
 
      console.warn('[Cart] addToCart fallback failed, reverting optimistic update', e);
      try {
        setCart({ ...prevCart, items: prevItems });
        await persistLocal(user.uid, { ...prevCart, items: prevItems });
      } catch (revertErr) {
        console.warn('[Cart] failed to revert optimistic update', revertErr);
      }
      throw e;
    }
  };

  const removeItem = async (productId) => {
    if (!user) throw new Error('Not authenticated');
    const itemRef = ref(db, `carts/${user.uid}/items/${productId}`);
    try {
      await remove(itemRef);
      console.log('[Cart] removed item', productId);
    } catch (e) {
      console.warn('removeItem failed', e);
      throw e;
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (!user) throw new Error('Not authenticated');
    const itemRef = ref(db, `carts/${user.uid}/items/${productId}`);
    try {
      if (newQuantity <= 0) {
        await remove(itemRef);
        console.log('[Cart] removed item via updateQuantity', productId);
      } else {
        await update(itemRef, { quantity: newQuantity });
        console.log('[Cart] updated quantity', productId, newQuantity);
      }
    } catch (e) {
      console.warn('updateQuantity failed', e);
      throw e;
    }
  };

  const clearCart = async () => {
    if (!user) throw new Error('Not authenticated');
    const cartRef = ref(db, `carts/${user.uid}`);
    try {
      await set(cartRef, { items: {} });
    } catch (e) {
      console.warn('clearCart failed', e);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
