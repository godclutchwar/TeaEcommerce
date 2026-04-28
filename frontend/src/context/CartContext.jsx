/*
 * PURPOSE: React Context that provides cart state to the entire app.
 *
 * WHAT CONTEXT IS:
 * Without Context, cart state would need to be passed down as props through every intermediate
 * component (Navbar needs cart count, CartPage needs full items, Checkout needs total).
 * Context creates a "global" state that any component can subscribe to via useCart().
 *
 * STATE SHAPES:
 * cartItems: Array of {id, product: {id, name, price, category, iconUnicode}, quantity}
 * loading: boolean — shows loading spinner during API calls
 *
 * FUNCTIONS:
 * - fetchCart: GET /api/cart → syncs with backend
 * - addToCart: POST /api/cart → then refetches to get updated state
 * - updateQty: PATCH /api/cart/{id} → changes quantity
 * - removeFromCart: DELETE /api/cart/{id} → removes item, updates local state
 * - clearCart: Resets cartItems to [] (used after successful order)
 * - totalPrice: Computed total in dollars (derived from cartItems)
 * - cartCount: Total number of items across all cart entries
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // This import is inside a callback to avoid circular deps with context
  const importApi = useCallback(() => import('../api/axios'), []);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const { default: api } = await importApi();
      const res = await api.get('/cart');
      setCartItems(res.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [importApi]);

  // Re-fetch cart whenever the user logs in or out
  useEffect(() => {
    fetchCart();
  }, [user, token, fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      const { default: api } = await importApi();
      await api.post('/cart', { productId, quantity });
      await fetchCart(); // refetch to get updated state with new totals
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  }, [fetchCart, importApi]);

  const updateQty = useCallback(async (itemId, quantity) => {
    try {
      const { default: api } = await importApi();
      await api.patch(`/cart/${itemId}`, null, { params: { quantity } });
      await fetchCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  }, [fetchCart, importApi]);

  const removeFromCart = useCallback(async (itemId) => {
    try {
      const { default: api } = await importApi();
      await api.delete(`/cart/${itemId}`);
      setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  }, [importApi]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const totalPrice = cartItems.reduce((sum, item) => {
    const priceCents = item.product?.price || 0;
    return sum + priceCents * item.quantity;
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        fetchCart,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        totalPrice,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
