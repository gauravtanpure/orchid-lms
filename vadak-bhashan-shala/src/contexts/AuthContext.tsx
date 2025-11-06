// /frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'; // 1. Import useCallback
import axios from 'axios';
// ... (Interface code is correct) ...
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
	isLoading: boolean;
	token: string | null;
	login: (identifier: string, password: string) => Promise<User>;
	// Changed email to be string | undefined to handle the optionality
	register: (name: string, email: string | undefined, phone: string, password: string) => Promise<void>;
	logout: () => void;
	isEnrolled: (courseId: string) => boolean;
	updateUserContext: (updatedUser: User) => void;
    // 🚨 NEW: Password Reset Functions
    sendPasswordResetOTP: (phone: string) => Promise<string>;
    verifyPasswordResetOTP: (phone: string, otp: string) => Promise<{ resetToken: string, message: string }>;
    resetUserPassword: (resetToken: string, newPassword: string, confirmNewPassword: string) => Promise<string>;
}
// ... (AuthContext creation is correct) ...
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'orchid_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

    // --- ⬇️ FIX 1: Wrap logout in useCallback ⬇️ ---
	const logout = useCallback(() => {
		localStorage.removeItem(AUTH_STORAGE_KEY);
		localStorage.removeItem('token');
		setUser(null);
		setToken(null);
	}, []); // Empty dependencies are correct here
    // --- ⬆️ END OF FIX 1 ⬆️ ---

    // --- ⬇️ FIX 2: Wrap updateUserContext in useCallback ⬇️ ---
	const updateUserContext = useCallback((updatedUser: User) => {
		const currentToken = localStorage.getItem('token');
		localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
		setUser(updatedUser);
		if (currentToken && !token) {
			setToken(currentToken);
			localStorage.setItem('token', currentToken);
		}
	}, [token]); // Add token as a dependency
    // --- ⬆️ END OF FIX 2 ⬆️ ---


	// ----------------------------------------------------------------------
	// Axios Interceptors (omitted for brevity, assume they are correct)
	// ----------------------------------------------------------------------
    useEffect(() => {
		const requestInterceptor = axios.interceptors.request.use(
			(config) => {
				// Get token from state first, fallback to localStorage
                // This ensures requests use the most current token
                const currentToken = token || localStorage.getItem('token');
				if (currentToken) {
					config.headers.Authorization = `Bearer ${currentToken}`;
				} else {
					delete config.headers.Authorization;
				}
				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		return () => {
			axios.interceptors.request.eject(requestInterceptor);
		};
	}, [token]); // Run this interceptor logic again if the token state changes

	useEffect(() => {
		const responseInterceptor = axios.interceptors.response.use(
			response => response,
			error => {
				if (error.response && error.response.status === 401) {
					const message = error.response.data?.message;
					if (message === 'Not authorized, token failed' || error.response.data?.message?.includes('jwt expired')) {
						console.error("Expired token detected. Logging out user.");
						logout(); 
					}
				}
				return Promise.reject(error);
			}
		);

		return () => {
			axios.interceptors.response.eject(responseInterceptor);
		};
	}, [logout]); // --- ⬆️ FIX 3: Add logout as a dependency ⬆️ ---

	useEffect(() => {
		try {
// ... (rest of the file is correct) ...
			const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
			const storedToken = localStorage.getItem('token');

			if (storedUser && storedToken) {
				const parsedUser = JSON.parse(storedUser);
				if (!parsedUser.id && parsedUser._id) {
					parsedUser.id = parsedUser._id;
				}

				setUser(parsedUser);
				setToken(storedToken);
			} else {
				logout();
			}
		} catch (error) {
			console.error("Failed to load user data from storage:", error);
			logout();
		} finally {
			setIsLoading(false);
		}
	}, [logout]); // Add logout here just in case (good practice)

	const login = async (identifier: string, password: string): Promise<User> => {
		const response = await axios.post(`${backendUrl}/api/auth/login`, { identifier, password });
		const { user: backendUser, token: newToken } = response.data;

		if (!backendUser.id && backendUser._id) {
			backendUser.id = backendUser._id;
		}

		localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(backendUser));
		localStorage.setItem('token', newToken);
		setUser(backendUser);
		setToken(newToken);
		return backendUser;
	};

	const register = async (name: string, email: string | undefined, phone: string, password: string) => {
		const response = await axios.post(`${backendUrl}/api/auth/register`, { name, email, phone, password });
		const { user: backendUser, token: newToken } = response.data;

		if (!backendUser.id && backendUser._id) {
			backendUser.id = backendUser._id;
		}

		localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(backendUser));
		localStorage.setItem('token', newToken);
		setUser(backendUser);
		setToken(newToken);
	};
    
    // ----------------------------------------------------------------------
    // 🚨 NEW: Password Reset Implementations
    // ----------------------------------------------------------------------

    const sendPasswordResetOTP = async (phone: string): Promise<string> => {
        try {
            const response = await axios.post(`${backendUrl}/api/auth/forgot-password/send-otp`, { phone });
            // The backend returns a simple success message
            return response.data.msg;
        } catch (error: any) {
            // Throw the error message for the component to catch
            throw new Error(error.response?.data?.msg || 'Failed to send OTP. Server error.');
        }
    };

    const verifyPasswordResetOTP = async (phone: string, otp: string): Promise<{ resetToken: string, message: string }> => {
        try {
            const response = await axios.post(`${backendUrl}/api/auth/forgot-password/verify-otp`, { phone, otp });
            // The backend returns a resetToken and a success message
            return { resetToken: response.data.resetToken, message: response.data.msg };
        } catch (error: any) {
             // Throw the error message for the component to catch
            throw new Error(error.response?.data?.msg || 'Failed to verify OTP. Server error.');
        }
    };

    const resetUserPassword = async (resetToken: string, newPassword: string, confirmNewPassword: string): Promise<string> => {
        try {
            const response = await axios.post(`${backendUrl}/api/auth/forgot-password/reset-password`, { resetToken, newPassword, confirmNewPassword });
             // The backend returns a success message
            return response.data.msg;
        } catch (error: any) {
             // Throw the error message for the component to catch
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