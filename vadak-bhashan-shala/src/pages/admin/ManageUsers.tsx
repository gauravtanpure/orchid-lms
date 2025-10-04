// /frontend/src/pages/admin/ManageUsers.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- Type Definition ---
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  date: string; 
}

// --- API Fetching Function ---
const fetchAllUsers = async (token: string | null): Promise<User[]> => {
    console.log('🔍 Token being sent:', token); // DEBUG
    
    if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
    }

    const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    console.log('📡 Making request to:', `${backendUrl}/api/admin/users`); // DEBUG
    console.log('🔑 Authorization header:', `Bearer ${token.substring(0, 20)}...`); // DEBUG (partial token)
    
    try {
        const { data } = await axios.get(`${backendUrl}/api/admin/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        console.log('✅ Successfully fetched users:', data); // DEBUG
        return data;
    } catch (error) {
        console.error('❌ Error fetching users:', error.response?.data || error.message); // DEBUG
        throw error;
    }
};

// --- Main Component ---
const ManageUsers: React.FC = () => {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    
    // Get token from localStorage
    const token = localStorage.getItem('token');

    console.log('👤 Current user:', user); // DEBUG
    console.log('🎫 Token from localStorage:', token ? 'EXISTS' : 'MISSING'); // DEBUG
    console.log('🔐 Is logged in:', isLoggedIn); // DEBUG

    // Check authentication and authorization
    React.useEffect(() => {
        if (!isLoggedIn || !user) {
            console.warn('⚠️ Not logged in, redirecting to login');
            navigate('/login');
            return;
        }
        
        if (user.role !== 'admin') {
            console.warn('⚠️ Not admin, redirecting to home');
            navigate('/');
            return;
        }
    }, [isLoggedIn, user, navigate]);

    const { data: users = [], isLoading, isError, error } = useQuery<User[], Error>({
        queryKey: ['users'],
        queryFn: () => fetchAllUsers(token),
        enabled: !!token && !!user && user.role === 'admin',
        retry: 1,
    });

    // Show loading state while checking authentication
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">User Management</h1>
            <Card className="shadow-lg">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Join Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-red-500 p-8">
                                        <div className="flex items-center justify-center gap-2">
                                            <AlertTriangle className="h-5 w-5" /> 
                                            {error?.message || 'Failed to load users.'}
                                        </div>
                                        <div className="text-sm mt-2 text-muted-foreground">
                                            Check the browser console for more details
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center p-8 text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && users.map((user) => (
                                <TableRow key={user._id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(user.date).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManageUsers;