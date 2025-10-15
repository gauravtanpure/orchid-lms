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
	email: string;
	role: 'user' | 'admin';
	enrolledCourses?: Enrollment[]; // This array holds the course IDs and completion rates
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
	// 💡 NEW: Function to manually update user data after actions like enrollment
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

	// 💡 NEW HELPER FUNCTION: To update context and local storage immediately
	const updateUserContext = (updatedUser: User) => {
		// Ensure the token is preserved, as the backend usually doesn't return it in non-auth routes
		const currentToken = localStorage.getItem('token');

		// Save the new user data to local storage
		localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));

		// Update the React state
		setUser(updatedUser);

		// Safety check for token in case the original call somehow cleared it
		if (currentToken && !token) {
			setToken(currentToken);
			localStorage.setItem('token', currentToken);
		}
	};


	// ----------------------------------------------------------------------
	// 🟢 FIX 1: Axios Request Interceptor
	// CRITICAL: This ensures the Authorization header is sent with every API call.
	// ----------------------------------------------------------------------
	useEffect(() => {
		const requestInterceptor = axios.interceptors.request.use(
			(config) => {
				// Attach the token only if it exists
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				} else {
					// Clear header if token is missing
					delete config.headers.Authorization;
				}
				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		// Cleanup function to remove the interceptor when component unmounts or token changes
		return () => {
			axios.interceptors.request.eject(requestInterceptor);
		};
	}, [token]); // Dependency on token ensures the header is updated/set/cleared

	// ----------------------------------------------------------------------
	// 🟢 FIX 2: Axios Response Interceptor (Moved to its own useEffect)
	// Handles expired tokens globally
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
	}, []); // Empty dependency array: runs only once on mount

	// Load user + token from localStorage on mount
	useEffect(() => {
		try {
			const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
			const storedToken = localStorage.getItem('token');

			if (storedUser && storedToken) {
				// Fix: Ensure the user object being parsed is correct
				const parsedUser = JSON.parse(storedUser);
				// Ensure the ID is available, using 'id' for React state and potentially '_id' for database
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

	// Removed unused setUserData as it's less direct than updateUserContext

	const login = async (email: string, password: string): Promise<User> => {
		const response = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
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

	const register = async (name: string, email: string, password: string) => {
		const response = await axios.post(`${backendUrl}/api/auth/register`, { name, email, password });
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
		// Check if the current user state contains the enrollment
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
				updateUserContext, // 💡 EXPOSE THE NEW UPDATE FUNCTION
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
