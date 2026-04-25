import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [stallId, setStallId] = useState(null);
  const [stallName, setStallName] = useState('');

  const addItem = (item, sId, sName) => {
    if (stallId && stallId !== sId) {
      if (!window.confirm('Starting a new order will clear your current cart. Continue?')) return;
      setCart([]);
    }
    setStallId(sId);
    setStallName(sName);
    setCart(prev => {
      const existing = prev.find(i => i.menuItem === item._id);
      if (existing) return prev.map(i => i.menuItem === item._id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price } : i);
      return [...prev, { menuItem: item._id, name: item.name, price: item.price, quantity: 1, subtotal: item.price }];
    });
  };

  const removeItem = (menuItemId) => {
    setCart(prev => {
      const updated = prev.map(i => i.menuItem === menuItemId ? { ...i, quantity: i.quantity - 1, subtotal: (i.quantity - 1) * i.price } : i).filter(i => i.quantity > 0);
      if (updated.length === 0) { setStallId(null); setStallName(''); }
      return updated;
    });
  };

  const clearCart = () => { setCart([]); setStallId(null); setStallName(''); };

  const total = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, stallId, stallName, addItem, removeItem, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
