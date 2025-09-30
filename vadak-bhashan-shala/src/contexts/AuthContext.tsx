import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  enrolledCourses: string[];
  profileImage: string;
  role: 'user' | 'admin'; // Add user role
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

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500)); 

    // Admin Credentials Check
    if (email === 'admin@orchid.com' && password && password.length > 0) {
      const mockAdmin: User = {
        id: 'admin-001',
        name: 'Admin User',
        email: email,
        enrolledCourses: [], // Admin doesn't enroll in courses
        profileImage: 'https://i.pravatar.cc/150?img=68', // Admin avatar
        role: 'admin', // Set role to admin
      };
      setUser(mockAdmin);
      return; // Stop execution for admin
    }
    
    // Regular Demo User Credentials Check
    if (email === 'demo@user.com' && password && password.length > 0) {
      const mockUser: User = {
        id: 'user-001',
        name: 'Demo User',
        email: email,
        enrolledCourses: ['course-101'],
        profileImage: 'https://i.pravatar.cc/150?img=1',
        role: 'user', // Set role to user
      };
      setUser(mockUser);
      return; // Stop execution for regular user
    } 
    
    throw new Error("Invalid credentials. Use admin@orchid.com or demo@user.com.");
  };

  const register = async (name: string, email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockNewUser: User = {
      id: `user-${Date.now()}`, 
      name: name,
      email: email,
      enrolledCourses: [],
      profileImage: 'https://i.pravatar.cc/150?img=2',
      role: 'user', // New users are always 'user'
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