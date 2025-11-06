// /frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast'; // Assuming you have a toast component

// --- Interfaces ---
interface Enrollment {
	courseId: string;
	completionRate: number;
	_id: string;
}

interface User {
	id: string;
	name: string;
	email?: string;
	phone: string; 
	role: 'user' | 'admin';
	enrolledCourses?: Enrollment[]; 
}

interface AuthContextType {
	user: User | null;
	isLoggedIn: boolean;
	isAuthenticated: boolean; // Keeping both for compatibility
	isLoading: boolean;
	token: string | null;
	login: (identifier: string, password: string) => Promise<User>;
	register: (name: string, email: string | undefined, phone: string, password: string) => Promise<void>;
	logout: () => void;
	isEnrolled: (courseId: string) => boolean;
	updateUserContext: (updatedUser: User) => void;
    sendPasswordResetOTP: (phone: string) => Promise<string>;
    verifyPasswordResetOTP: (phone: string, otp: string) => Promise<{ resetToken: string, message: string }>;
    resetUserPassword: (resetToken: string, newPassword: string, confirmNewPassword: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const { toast } = useToast();

	// 🚀 FIX: Initialization logic to restore session from local storage
	useEffect(() => {
		const storedToken = localStorage.getItem('token');
		const storedUser = localStorage.getItem('user');

		if (storedToken && storedUser) {
			try {
				const userData = JSON.parse(storedUser);
                
                // 1. Set Axios header globally for all subsequent authenticated requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`; 
                
                // 2. Restore state
				setToken(storedToken);
				setUser(userData);
			} catch (error) {
				console.error("Failed to parse stored user data:", error);
                // Clear bad data to avoid infinite loops or further errors
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete axios.defaults.headers.common['Authorization'];
			}
		}
		
        // 3. Set loading to false once initialization is complete
		setIsLoading(false); 
        
        // Dependency array is empty to run once on mount
	}, []); 

	const login = async (identifier: string, password: string): Promise<User> => {
		try {
			const response = await axios.post(`${backendUrl}/api/auth/login`, { identifier, password });
			const { token: newToken, user: userData } = response.data;

			// Store data
			localStorage.setItem('token', newToken);
			localStorage.setItem('user', JSON.stringify(userData));

			// Set state
			setToken(newToken);
			setUser(userData);
            
            // Set Axios header immediately after successful login
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`; 

			return userData;
		} catch (error: any) {
			toast({
				title: "Login Failed",
				description: error.response?.data?.message || 'Server error during login.',
				variant: "destructive",
			});
			throw new Error(error.response?.data?.message || 'Login failed.');
		}
	};

    const register = async (name: string, email: string | undefined, phone: string, password: string): Promise<void> => {
        try {
            await axios.post(`${backendUrl}/api/auth/register`, { name, email, phone, password });
            toast({
                title: "Registration Successful",
                description: "You have successfully registered. Please log in.",
            });
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.response?.data?.message || 'Server error during registration.',
                variant: "destructive",
            });
            throw new Error(error.response?.data?.message || 'Registration failed.');
        }
    };

	const logout = useCallback(() => {
		// Clear data
		localStorage.removeItem('token');
		localStorage.removeItem('user');
        
        // Clear state
		setToken(null);
		setUser(null);
        
        // Clear Axios header
        delete axios.defaults.headers.common['Authorization'];
        
        // Notify user
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
        });
	}, [toast]);

	const updateUserContext = useCallback((updatedUser: User) => {
		setUser(updatedUser);
		localStorage.setItem('user', JSON.stringify(updatedUser));
	}, []);
    
    // --- Password Reset Functions (Keeping for completeness) ---

    const sendPasswordResetOTP = async (phone: string): Promise<string> => {
        try {
            const response = await axios.post(`${backendUrl}/api/auth/forgot-password/send-otp`, { phone });
            return response.data.msg;
        } catch (error: any) {
            throw new Error(error.response?.data?.msg || 'Failed to send OTP. Server error.');
        }
    };

    const verifyPasswordResetOTP = async (phone: string, otp: string): Promise<{ resetToken: string, message: string }> => {
        try {
            const response = await axios.post(`${backendUrl}/api/auth/forgot-password/verify-otp`, { phone, otp });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.msg || 'Failed to verify OTP. Server error.');
        }
    };

    const resetUserPassword = async (resetToken: string, newPassword: string, confirmNewPassword: string): Promise<string> => {
        try {
            const response = await axios.post(`${backendUrl}/api/auth/forgot-password/reset-password`, { resetToken, newPassword, confirmNewPassword });
            return response.data.msg;
        } catch (error: any) {
            throw new Error(error.response?.data?.msg || 'Failed to reset password. Server error.');
        }
    };

	const isEnrolled = (courseId: string) => {
		return user?.enrolledCourses?.some(e => e.courseId === courseId) || false;
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoggedIn: !!user,
				isAuthenticated: !!user,
				isLoading,
				token,
				login,
				register,
				logout,
				isEnrolled,
				updateUserContext,
                sendPasswordResetOTP,
                verifyPasswordResetOTP,
                resetUserPassword,
			}}
		>
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