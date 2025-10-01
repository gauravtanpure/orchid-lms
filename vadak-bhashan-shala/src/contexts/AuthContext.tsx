import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// ⚠️ IMPORTANT: REPLACE WITH YOUR ACTUAL FASTAPI/MONGO ENDPOINTS
const API_BASE_URL = 'http://localhost:8000/api/v1/auth'; 

interface User {
  id: string;
  name: string;
  email: string;
  enrolledCourses: string[];
  role: 'user' | 'admin'; 
}

// Interface for API responses (may include token)
interface LoginResponse {
    token: string;
    user: User;
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

// --- Hardcoded Demo Users for Frontend Testing ---
const mockAdmin: User = {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@orchid.com',
    enrolledCourses: [],
    role: 'admin',
};

const mockUser: User = {
    id: 'user-001',
    name: 'Demo User',
    email: 'demo@user.com',
    enrolledCourses: ['course-101'],
    role: 'user',
};
// ------------------------------------------------

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

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // 1. HARDCODED FRONTEND TEST LOGIN
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    if (email === mockAdmin.email && password && password.length > 0) {
        setUser(mockAdmin);
        return; 
    }
    
    if (email === mockUser.email && password && password.length > 0) {
        setUser(mockUser);
        return; 
    } 
    
    // 2. API BACKEND LOGIN
    try {
      const response = await fetch(`${API_BASE_URL}/login`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'API Login failed.' }));
        // If API fails, check if it's due to invalid hardcoded credentials 
        // (if the user tried the hardcoded creds but API still ran)
        if (errorData.detail && !errorData.detail.includes('Invalid credentials')) {
            throw new Error(errorData.detail);
        }
        
        // Final fallback error if both hardcoded and API login fail
        throw new Error("Invalid credentials or user not found.");
      }

      const userData: LoginResponse = await response.json();
      // Assume API returns a User object structure that matches
      setUser(userData.user); 

    } catch (error) {
      // Throw the error to be caught by Login.tsx
      throw error; 
    }
  };

  const register = async (name: string, email: string, password: string) => {
    // 1. HARDCODED: If someone tries to register with a hardcoded email, prevent it
    if (email === mockAdmin.email || email === mockUser.email) {
        throw new Error("This email is reserved for demo purposes.");
    }
    
    // 2. API BACKEND REGISTRATION
    try {
      const response = await fetch(`${API_BASE_URL}/register`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Registration failed due to network or server error.' }));
        throw new Error(errorData.detail || 'Registration failed. Try a different email.');
      }
      
      // We assume the API returns a success message or the new user object (but not auto-login)
      await response.json(); // Consume the response
      
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };
  
  const isEnrolled = (courseId: string) => {
    return user?.enrolledCourses.includes(courseId) || false;
  };

  const enrollCourse = (courseId: string) => {
    if (user && !user.enrolledCourses.includes(courseId)) {
      setUser({
        ...user,
        enrolledCourses: [...user.enrolledCourses, courseId],
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