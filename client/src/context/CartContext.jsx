import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cart.service.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

const GUEST_CART_KEY = 'kivo_guest_cart';

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 3500);
  };

  const calculateGuestCart = (items) => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = parseFloat(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
    );
    const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 99.00;
    const tax = parseFloat((subtotal * 0.18).toFixed(2));
    const total = parseFloat((subtotal + shipping + tax).toFixed(2));

    return {
      items,
      itemCount,
      subtotal,
      shipping,
      tax,
      total,
    };
  };

  // Fetch or initialize cart
  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        // Sync any guest cart items first if present
        const savedGuest = localStorage.getItem(GUEST_CART_KEY);
        if (savedGuest) {
          try {
            const guestItems = JSON.parse(savedGuest);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              await cartService.syncCart(guestItems);
              localStorage.removeItem(GUEST_CART_KEY);
            }
          } catch {
            localStorage.removeItem(GUEST_CART_KEY);
          }
        }
        const serverCart = await cartService.getCart();
        setCart(serverCart || calculateGuestCart([]));
      } else {
        // Guest mode
        const savedGuest = localStorage.getItem(GUEST_CART_KEY);
        if (savedGuest) {
          try {
            const items = JSON.parse(savedGuest);
            setCart(calculateGuestCart(items));
          } catch {
            setCart(calculateGuestCart([]));
          }
        } else {
          setCart(calculateGuestCart([]));
        }
      }
    } catch {
      setCart(calculateGuestCart([]));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Save guest cart to localStorage
  const saveGuestItems = (items) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    setCart(calculateGuestCart(items));
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      if (isAuthenticated) {
        const updated = await cartService.addToCart(product.id, quantity);
        setCart(updated);
      } else {
        // Guest cart
        const existingIndex = cart.items.findIndex(
          (i) => i.productId === product.id || i.id === product.id
        );
        let newItems = [...cart.items];

        const primaryImage = Array.isArray(product.images)
          ? product.images[0]
          : typeof product.images === 'string'
          ? JSON.parse(product.images)[0]
          : product.image;

        if (existingIndex > -1) {
          const newQty = Math.min(
            product.stock,
            newItems[existingIndex].quantity + quantity
          );
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newQty,
            lineTotal: parseFloat((newItems[existingIndex].price * newQty).toFixed(2)),
          };
        } else {
          newItems.push({
            id: `guest_${Date.now()}_${Math.random()}`,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            image: primaryImage,
            stock: product.stock,
            quantity: Math.min(product.stock, quantity),
            lineTotal: parseFloat((product.price * Math.min(product.stock, quantity)).toFixed(2)),
          });
        }
        saveGuestItems(newItems);
      }
      showToast(`${product.name} added to cart!`, 'success');
      setIsCartOpen(true);
    } catch (err) {
      showToast(err.message || 'Failed to add item to cart.', 'error');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (isAuthenticated) {
        const updated = await cartService.updateQuantity(itemId, quantity);
        setCart(updated);
      } else {
        let newItems = cart.items
          .map((item) => {
            if (item.id === itemId || item.productId === itemId) {
              if (quantity <= 0) return null;
              const safeQty = Math.min(item.stock, quantity);
              return {
                ...item,
                quantity: safeQty,
                lineTotal: parseFloat((item.price * safeQty).toFixed(2)),
              };
            }
            return item;
          })
          .filter(Boolean);
        saveGuestItems(newItems);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update quantity.', 'error');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      if (isAuthenticated) {
        const updated = await cartService.removeItem(itemId);
        setCart(updated);
      } else {
        const newItems = cart.items.filter(
          (item) => item.id !== itemId && item.productId !== itemId
        );
        saveGuestItems(newItems);
      }
      showToast('Item removed from cart.', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to remove item.', 'error');
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        const updated = await cartService.clearCart();
        setCart(updated);
      } else {
        localStorage.removeItem(GUEST_CART_KEY);
        setCart(calculateGuestCart([]));
      }
    } catch (err) {
      showToast(err.message || 'Failed to clear cart.', 'error');
    }
  };

  const getItemQuantity = (productId) => {
    const item = cart.items.find((i) => i.productId === productId || i.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
        toast,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
