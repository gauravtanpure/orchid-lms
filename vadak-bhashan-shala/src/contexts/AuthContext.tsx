import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  enrolledCourses: string[];
  profileImage: string; // Added profile image
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>; // Added register
  logout: () => void;
  isEnrolled: (courseId: string) => boolean; // New: Helper to check if a course is enrolled
  enrollCourse: (courseId: string) => void; // New: Helper to enroll in a course (for cart purchase simulation)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Local Storage Key ---
const AUTH_STORAGE_KEY = 'orchid_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize state from localStorage
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null;
    }
  });

  // Effect to update localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    // Demo Credentials Check
    if (email === 'demo@user.com' && password && password.length > 0) {
      const mockUser: User = {
        id: '1',
        name: 'Demo User',
        email: email,
        enrolledCourses: ['course-101'], // Pre-enrolled course for demonstration
        profileImage: 'https://i.pravatar.cc/150?img=1' // Placeholder image
      };
      setUser(mockUser);
    } else {
      throw new Error("Invalid credentials or user not found. Use email: demo@user.com and any password.");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    // Mock registration: auto-login the new user
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    const mockNewUser: User = {
      id: `user-${Date.now()}`, 
      name: name,
      email: email,
      enrolledCourses: [],
      profileImage: 'https://i.pravatar.cc/150?img=2' // Another placeholder
    };
    setUser(mockNewUser);
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