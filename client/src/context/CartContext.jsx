import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'tpi_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { vendorId: null, vendorName: null, items: [] };
  } catch {
    return { vendorId: null, vendorName: null, items: [] };
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);
  const [conflictMessage, setConflictMessage] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // food: { id, food_name, price, vendor_id, business_name }
  const addItem = (food, quantity = 1) => {
    setConflictMessage('');
    if (cart.vendorId && cart.vendorId !== food.vendor_id) {
      setConflictMessage(
        `Your cart already has items from ${cart.vendorName}. Clear your cart first to order from ${food.business_name}.`
      );
      return false;
    }
    setCart((prev) => {
      const existing = prev.items.find((it) => it.foodId === food.id);
      let items;
      if (existing) {
        items = prev.items.map((it) => it.foodId === food.id ? { ...it, quantity: it.quantity + quantity } : it);
      } else {
        items = [...prev.items, {
          foodId: food.id,
          name: food.food_name,
          price: parseFloat(food.price),
          image: food.image,
          quantity
        }];
      }
      return { vendorId: food.vendor_id, vendorName: food.business_name, items };
    });
    return true;
  };

  const increment = (foodId) => setCart((prev) => ({
    ...prev, items: prev.items.map((it) => it.foodId === foodId ? { ...it, quantity: it.quantity + 1 } : it)
  }));

  const decrement = (foodId) => setCart((prev) => ({
    ...prev,
    items: prev.items
      .map((it) => it.foodId === foodId ? { ...it, quantity: it.quantity - 1 } : it)
      .filter((it) => it.quantity > 0)
  }));

  const removeItem = (foodId) => setCart((prev) => {
    const items = prev.items.filter((it) => it.foodId !== foodId);
    return items.length ? { ...prev, items } : { vendorId: null, vendorName: null, items: [] };
  });

  const clearCart = () => {
    setCart({ vendorId: null, vendorName: null, items: [] });
    setConflictMessage('');
  };

  const subtotal = cart.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const itemCount = cart.items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addItem, increment, decrement, removeItem, clearCart, subtotal, itemCount, conflictMessage, setConflictMessage
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
