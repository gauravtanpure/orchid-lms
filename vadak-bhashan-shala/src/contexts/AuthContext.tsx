// /frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

// Interface for User and API response
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  enrolledCourses?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isEnrolled: (courseId: string) => boolean;
  enrollCourse: (courseId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'orchid_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null;
    }
  });

  const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
      const { user } = response.data;
      localStorage.setItem('token', response.data.token);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      setUser(user);
    } catch (error) {
      throw new Error(error.response?.data?.msg || 'Login failed.');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${backendUrl}/api/auth/register`, { name, email, password });
      const { user } = response.data;
      localStorage.setItem('token', response.data.token);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      setUser(user);
    } catch (error) {
      throw new Error(error.response?.data?.msg || 'Registration failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };
  
  const isEnrolled = (courseId: string) => {
    return user?.enrolledCourses?.includes(courseId) || false;
  };

  const enrollCourse = (courseId: string) => {
    if (user && !user.enrolledCourses?.includes(courseId)) {
      setUser({
        ...user,
        enrolledCourses: [...(user.enrolledCourses || []), courseId],
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      login,
      register,
      logout,
      isEnrolled,
      enrollCourse,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};