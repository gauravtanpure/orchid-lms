import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// 🟢 FIX: Corrected import path using alias
import { useAuth } from '@/contexts/AuthContext'; 
import axios from 'axios';

// --- Assumed Interfaces from your Project (Updated) ---\r\n
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
// -------------------------------------------\r\n

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
  const { user, isAuthenticated, token } = useAuth();
  
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
    if (!isAuthenticated || !token) {
      throw new Error('User must be logged in to checkout.');
    }
    
    // The simplified API needs course IDs
    const courseIds = items.map(item => item._id);

    try {
      // Assuming your backend has an /api/enrollment endpoint
      await axios.post(`${API_URL}/api/enrollment`, 
        { courseIds }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      clearCart();
      
      // OPTIONAL: Dispatch a custom event to notify other components (like CourseCard)
      document.dispatchEvent(new Event('courses-updated'));

      console.log('Checkout successful. User enrolled and cart cleared.');
    } catch (error: any) {
      console.error('Checkout failed:', error.response || error);
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