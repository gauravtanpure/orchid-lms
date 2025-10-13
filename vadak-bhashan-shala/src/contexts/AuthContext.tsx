import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

interface Enrollment {
  courseId: string;
  completionRate: number;
  _id: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  enrolledCourses?: Enrollment[];
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isEnrolled: (courseId: string) => boolean;
  setUserData: (newUserData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'orchid_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

  // Load user + token from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedToken = localStorage.getItem('token');
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedToken) setToken(storedToken);
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setUserData = (newUserData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, ...newUserData };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const login = async (email: string, password: string): Promise<User> => {
    const response = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
    const { user, token: newToken } = response.data;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem('token', newToken);
    setUser(user);
    setToken(newToken);
    return user;
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await axios.post(`${backendUrl}/api/auth/register`, { name, email, password });
    const { user, token: newToken } = response.data;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem('token', newToken);
    setUser(user);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  const isEnrolled = (courseId: string) => {
    return user?.enrolledCourses?.some(e => e.courseId === courseId) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        token,
        login,
        register,
        logout,
        isEnrolled,
        setUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
