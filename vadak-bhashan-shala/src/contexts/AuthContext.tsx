// /frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

// Interface for enrollment object to match backend schema (User.js)
interface Enrollment {
  courseId: string; // The ID of the course
  completionRate: number;
  _id: string; // The ID of the enrollment document itself
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  enrolledCourses?: Enrollment[]; // FIX: updated to array of Enrollment objects
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  token: string | null; // ADD: token to context
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isEnrolled: (courseId: string) => boolean;
  setUserData: (newUserData: Partial<User>) => void; // CRITICAL ADD: Function to update user data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'orchid_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null); // ADD: token state

  const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedToken = localStorage.getItem('token');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // CRITICAL ADD: setUserData implementation
  const setUserData = (newUserData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, ...newUserData };
      // Update local storage immediately
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
      const { user, token: newToken } = response.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      setToken(newToken);
      setUser(user);
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.msg || 'Login failed.');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${backendUrl}/api/auth/register`, { name, email, password });
      const { user, token: newToken } = response.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      setToken(newToken);
      setUser(user);
    } catch (error) {
      throw new Error(error.response?.data?.msg || 'Registration failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const isEnrolled = (courseId: string) => {
    // CRITICAL FIX: Check courseId property within the enrollment objects
    return user?.enrolledCourses?.some(enrollment => enrollment.courseId === courseId) || false;
  };

  // Removed old 'enrollCourse' function, as enrollment is now server-side

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isLoading,
      token, // PROVIDE: token
      login,
      register,
      logout,
      isEnrolled,
      setUserData, // PROVIDE: setUserData
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