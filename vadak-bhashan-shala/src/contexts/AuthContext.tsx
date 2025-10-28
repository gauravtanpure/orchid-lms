// /frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
// Removed unused Navigate import

interface Enrollment {
	courseId: string;
	completionRate: number;
	_id: string;
}

interface User {
	id: string;
	name: string;
	// 🚨 MODIFIED: Email is now optional in the User interface
	email?: string; 
	// 🚨 MODIFIED: Phone is now explicitly defined
	phone: string; 
	role: 'user' | 'admin';
	enrolledCourses?: Enrollment[]; // This array holds the course IDs and completion rates
}

interface AuthContextType {
	user: User | null;
	isLoggedIn: boolean;
	isLoading: boolean;
	token: string | null;
	// 🚨 MODIFIED: login now accepts a single 'identifier' (email or phone)
	login: (identifier: string, password: string) => Promise<User>;
	// 🚨 MODIFIED: register now takes a required phone (TypeScript doesn't know about the backend requirement so we make email optional here)
	register: (name: string, email: string | undefined, phone: string, password: string) => Promise<void>;
	logout: () => void;
	isEnrolled: (courseId: string) => boolean;
	updateUserContext: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'orchid_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

	const logout = () => {
		localStorage.removeItem(AUTH_STORAGE_KEY);
		localStorage.removeItem('token');
		setUser(null);
		setToken(null);
	};

	const updateUserContext = (updatedUser: User) => {
		const currentToken = localStorage.getItem('token');
		localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
		setUser(updatedUser);
		if (currentToken && !token) {
			setToken(currentToken);
			localStorage.setItem('token', currentToken);
		}
	};


	// ----------------------------------------------------------------------
	// Axios Request Interceptor
	// ----------------------------------------------------------------------
	useEffect(() => {
		const requestInterceptor = axios.interceptors.request.use(
			(config) => {
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
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
	}, [token]); 

	// ----------------------------------------------------------------------
	// Axios Response Interceptor
	// ----------------------------------------------------------------------
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
	}, []); 

	// Load user + token from localStorage on mount
	useEffect(() => {
		try {
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
	}, []);

	// 🚨 MODIFIED: Login function (correctly uses identifier)
	const login = async (identifier: string, password: string): Promise<User> => {
		// Send the identifier field instead of email
		const response = await axios.post(`${backendUrl}/api/auth/login`, { identifier, password });
		const { user: backendUser, token: newToken } = response.data;

		// Ensure 'id' is used for frontend consistency
		if (!backendUser.id && backendUser._id) {
			backendUser.id = backendUser._id;
		}

		localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(backendUser));
		localStorage.setItem('token', newToken);
		setUser(backendUser);
		setToken(newToken);
		return backendUser;
	};

	// 🚨 MODIFIED: Register function now explicitly passes phone (which is required by backend)
	const register = async (name: string, email: string | undefined, phone: string, password: string) => {
		// Send phone along with other details
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