import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// 🟢 FIX: Corrected import path using alias
import { useAuth } from '@/contexts/AuthContext'; 
import axios from 'axios';

// --- Assumed Interfaces from your Project ---
export interface Course {
  id: string;
  _id: string; // Using '_id' for backend communication
  title: string;
  price: number;
  image: string;
  instructor: string;
  language: 'en' | 'mr';
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

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use localStorage to persist cart items
  const [items, setItems] = useState<CartItem[]>(() => {
    const storedCart = localStorage.getItem('cartItems');
    return storedCart ? JSON.parse(storedCart) : [];
  });
  
  // Get token and setUserData from useAuth
  const { token, updateUserContext } = useAuth();


  // Persist items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }, [items]);

  const addToCart = (course: Course) => {
    setItems(prevItems => {
      // Find course using _id for consistency
      const exists = prevItems.find(item => item._id === course._id); 
      if (exists) {
        // Increment quantity (though usually courses are added once)
        return prevItems.map(item => 
          item._id === course._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Add new course with quantity 1
        // Ensure we use the course object properties correctly
        const newCartItem: CartItem = {
             ...course, 
             quantity: 1, 
             // Ensure optional fields are handled if needed, though spreading handles most cases
        };
        return [...prevItems, newCartItem];
      }
    });
  };

  const removeFromCart = (courseId: string) => {
    // Remove based on courseId (_id)
    setItems(prevItems => prevItems.filter(item => item._id !== courseId));
  };

  const clearCart = () => {
    setItems([]);
  };

const checkout = async () => {
  if (!token) {
    throw new Error('Authentication token is missing. Please log in.');
  }
  if (items.length === 0) {
    throw new Error('Cart is empty. Add courses to proceed.');
  }

  const courseIds = items
  .map(item => item._id || item.id) // ✅ Use _id first, fallback to id
  .filter(id => id && id !== 'undefined' && id !== null); // ✅ Filter invalid values

console.log("🟢 Enrolling with courseIds:", courseIds);

if (courseIds.length === 0) {
  throw new Error('No valid course IDs found in cart.');
}

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    const response = await axios.post(`${API_URL}/api/users/enroll`, { courseIds }, config);
    const { user: updatedUser } = response.data;

    // ✅ FIXED: Use updateUserContext instead of setUserData
    updateUserContext(updatedUser);
    clearCart();

    // 🔁 Notify MyCourses to refresh data
    window.dispatchEvent(new Event('courses-updated'));

    console.log('Checkout successful. User enrolled and cart cleared.');
  } catch (error: any) {
    console.error('Checkout failed:', error.response || error);
    throw new Error(error.response?.data?.message || 'Enrollment failed: Please try logging in again.');
  }
};


  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
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

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
