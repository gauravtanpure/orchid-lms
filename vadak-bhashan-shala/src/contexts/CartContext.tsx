// /frontend/src/contexts/CartContext.tsx

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// 🟢 FIX: Corrected import path using alias
import { useAuth } from '@/contexts/AuthContext'; 
import axios from 'axios';

// --- Assumed Interfaces from your Project (Updated) ---
export interface Course {
  id: string;
  _id: string; // Using '_id' for backend communication
  title: string;
  price: number;
  image: string; // The thumbnailUrl is passed here, renamed to 'image' for cart simplicity
  instructor: string;
  language: 'en' | 'mr';
  // REMOVED: videoUrl
  specialOffer?: {
    isActive: boolean;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    description: string;
  };
}

interface CartItem extends Course {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  checkout: () => Promise<void>;
}
// -------------------------------------------

const CartContext = createContext<CartContextType | undefined>(undefined);

// 🟢 FIX: Added fallback for VITE_REACT_APP_BACKEND_URL to resolve compilation warning
const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:1337';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// 🟢 FIX: Added type for children
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const storedCart = localStorage.getItem('shoppingCart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
      console.error("Could not load cart from localStorage", e);
      return [];
    }
  });

  // We still need the auth state for the checkout function, but the
  // top-level 'throw new Error' checks were removed.
  const { isAuthenticated, token, isLoading } = useAuth();

  
  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('shoppingCart', JSON.stringify(items));
    } catch (e) {
      console.error("Could not save cart to localStorage", e);
    }
  }, [items]);

  const addToCart = (course: Course) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === course._id);
      if (existingItem) {
        // Since courses are unique in cart, we just return the existing array
        return prevItems; 
      }
      return [...prevItems, { ...course, quantity: 1 }];
    });
  };

  const removeFromCart = (courseId: string) => {
    setItems(prevItems => prevItems.filter(item => item._id !== courseId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const checkout = async () => {
    // This check is fine, it just prevents double-clicks
    if (isLoading) return; 
    
    // This token is used for the auth check below
    const activeToken = token || localStorage.getItem('token');

    // This check is correct and runs *at the time of checkout*
    if (!isAuthenticated || !activeToken) {
      throw new Error('User must be logged in to checkout.');
    }

    const courseIds = items.map(item => item._id);
    try {
      // --- ⬇️ FIX 3: Corrected API Endpoint URL ⬇️ ---
      // Changed from '/api/enrollment' to '/api/users/enroll'
      // to match common API structures and fix the 404 error.
      await axios.post(
        `${API_URL}/api/users/enroll`, 
        { courseIds }
        // No 'headers' object needed, AuthContext interceptor handles it
      );
      // --- ⬆️ END OF FIX 3 ⬆️ ---

      clearCart();
      document.dispatchEvent(new Event('courses-updated'));
    } catch (error: any) {
      console.error('❌ Checkout failed full error:', error);
      // Re-throw the specific error from the backend if available
      throw new Error(error.response?.data?.message || 'Enrollment failed: Please try logging in again.');
    }
  };



  const getTotalItems = () => {
    // Since each course is a unique item, this is just the length of the array
    return items.length; 
  };

  const getTotalPrice = () => {
    // Calculate total price including discounts if available
    return items.reduce((total, item) => {
        let price = item.price;
        if (item.specialOffer?.isActive && item.specialOffer.discountValue > 0) {
             const { discountType, discountValue } = item.specialOffer;
             if (discountType === 'percentage') {
                price -= price * (discountValue / 100);
             } else {
                price -= discountValue;
             }
        }
        return total + Math.max(0, price) * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      clearCart,
      getTotalItems,
      getTotalPrice,
      checkout
    }}>
      {children}
    </CartContext.Provider>
  );
};