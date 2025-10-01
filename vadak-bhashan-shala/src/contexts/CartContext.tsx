import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

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
      getTotalPrice
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