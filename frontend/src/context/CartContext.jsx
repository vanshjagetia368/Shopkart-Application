import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../services/api';

// ── Create Context ──────────────────────────────────────────
const CartContext = createContext(null);

// ── Provider ────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);  // [{product: {...}, quantity: N}]
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  // Derived values — computed from state, never stored in DB
  const totalItems    = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal      = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // ── Fetch cart from backend ────────────────────────────────
  const fetchCart = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getCart();
      setCartItems(res.data.cart);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError('Unable to load cart.');
      }
      // 401 → user not logged in, cart stays empty silently
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart on mount (once user is authenticated)
  useEffect(() => { fetchCart(); }, [fetchCart]);

  // ── Add to cart ────────────────────────────────────────────
  const add = async (productId) => {
    const res = await addToCart(productId);
    setCartItems(res.data.cart); // backend returns updated populated cart
  };

  // ── Update quantity ────────────────────────────────────────
  const updateQty = async (productId, quantity) => {
    const res = await updateCartItem(productId, quantity);
    setCartItems(res.data.cart);
  };

  // ── Remove item ────────────────────────────────────────────
  const remove = async (productId) => {
    const res = await removeFromCart(productId);
    setCartItems(res.data.cart);
  };

  // ── Clear cart ─────────────────────────────────────────────
  const clear = async () => {
    await clearCart();
    setCartItems([]);
  };

  // ── Reset (called on logout) ───────────────────────────────
  const reset = () => setCartItems([]);

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      error,
      totalItems,
      subtotal,
      fetchCart,
      add,
      updateQty,
      remove,
      clear,
      reset,
    }}>
      {children}
    </CartContext.Provider>
  );
}

// ── Custom hook ─────────────────────────────────────────────
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
