import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

export interface Course {
  id: string;
  title: string;
  price: number;
  image: string;
  instructor: string;
  language: 'en' | 'mr';
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
  // 🟢 ADD: checkout function
  checkout: () => Promise<void>; 
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  // 🟢 FIX: Get token and setUserData from useAuth
  const { token, setUserData } = useAuth(); 

  // Debug: Log cart state changes
  useEffect(() => {
    console.log('Cart items updated:', items);
  }, [items]);

  const addToCart = (course: Course) => {
    console.log('CartContext.addToCart called with:', course);
    
    try {
      setItems(prev => {
        const existing = prev.find(item => item.id === course.id);
        
        if (existing) {
          console.log('Course already in cart, increasing quantity');
          return prev.map(item =>
            item.id === course.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        
        console.log('Adding new course to cart');
        return [...prev, { ...course, quantity: 1 }];
      });
      
      console.log('Cart update successful');
    } catch (error) {
      console.error('Error in addToCart:', error);
      throw error;
    }
  };

  const removeFromCart = (courseId: string) => {
    console.log('Removing course from cart:', courseId);
    setItems(prev => prev.filter(item => item.id !== courseId));
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setItems([]);
  };

  const checkout = async () => {
    if (!token) {
        throw new Error('Authentication token is missing. Please log in.');
    }
    if (items.length === 0) {
        console.log('Cart is empty. Nothing to checkout.');
        return;
    }

    // Use course.id which maps to MongoDB _id on the backend
    const courseIds = items.map(item => item.id);

    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // This hits the POST /api/users/enroll endpoint in userRoutes.js
        const response = await axios.post(`${API_URL}/api/users/enroll`, { courseIds }, config);

        const { user: updatedUser } = response.data;
        
        // 🟢 CRITICAL FIX: Update the user state in AuthContext with the new enrolled courses
        // This syncs the frontend state immediately after a successful backend enrollment.
        setUserData({ enrolledCourses: updatedUser.enrolledCourses }); 
        
        clearCart(); // Clear the cart on successful enrollment
        console.log('Checkout successful. User enrolled and cart cleared.');
    } catch (error) {
        console.error('Checkout failed:', error);
        throw new Error(error.response?.data?.message || 'Enrollment failed.');
    }
  };

  const getTotalItems = () => {
    const total = items.reduce((total, item) => total + item.quantity, 0);
    console.log('Total items:', total);
    return total;
  };

  const getTotalPrice = () => {
    const total = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    console.log('Total price:', total);
    return total;
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