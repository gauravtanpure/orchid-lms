import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, UserCheck, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

// --- Type Definitions ---
// These should match the structure of the data coming from your backend API
interface Course {
  _id: string;
  title: string;
  price: number;
}

interface User {
  _id: string;
  name:string;
  email: string;
  role: string;
  createdAt: string; // From backend, this will likely be a string
  enrolledCourses: Course[]; // Assuming courses are populated by the backend
  totalSpent: number; // Assuming the backend calculates this for us
}

interface Payment {
    _id: string;
    courseId: Course; // Assuming the course is populated
    amount: number;
    createdAt: string;
    transactionId: string;
}

// --- API Fetching Functions ---
const fetchAllUsers = async (): Promise<User[]> => {
    // IMPORTANT: This assumes you have a protected admin route at '/api/admin/users'
    const { data } = await axios.get('http://localhost:5000/api/admin/users');
    return data;
};

const fetchUserPayments = async (userId: string): Promise<Payment[]> => {
    // IMPORTANT: This assumes a route to get payments for a specific user
    const { data } = await axios.get(`http://localhost:5000/api/admin/payments/${userId}`);
    return data;
}

// --- Components ---
const UserDetailsDialog: React.FC<{ user: User, onClose: () => void }> = ({ user, onClose }) => {
    const { data: payments = [], isLoading, isError } = useQuery<Payment[]>({
        queryKey: ['userPayments', user._id],
        queryFn: () => fetchUserPayments(user._id),
    });

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-primary" /> User Profile & Transactions
                    </DialogTitle>
                    <DialogDescription>
                        Detailed information and complete payment history for {user.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">General Info</h3>
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Join Date:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                            <p><strong>Total Spent:</strong> <span className="font-bold text-green-600">₹{user.totalSpent.toLocaleString('en-IN')}</span></p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Purchased Courses ({user.enrolledCourses.length})</h3>
                            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-2">
                                {user.enrolledCourses.map(course => (
                                    <Badge key={course._id} variant="secondary">{course.title}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mt-4 border-t pt-4">Payment Transaction History</h3>
                    {isLoading && <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                    {isError && <div className="text-red-500 text-center p-4">Failed to load payment history.</div>}
                    {!isLoading && !isError && (
                        <Table>
                            <TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Transaction ID</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {payments.map(payment => (
                                    <TableRow key={payment._id}>
                                        <TableCell className="font-medium">{payment.courseId?.title || 'N/A'}</TableCell>
                                        <TableCell className="text-green-600 font-semibold">₹{payment.amount.toLocaleString('en-IN')}</TableCell>
                                        <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{payment.transactionId}</TableCell>
                                    </TableRow>
                                ))}
                                {payments.length === 0 && (
                                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No purchases found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

const ManageUsers: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    
    const { data: users = [], isLoading, isError } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: fetchAllUsers,
    });

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">User & Payment Management</h1>
            
            {selectedUser && <UserDetailsDialog user={selectedUser} onClose={() => setSelectedUser(null)} />}

            <Card className="shadow-lg">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow><TableHead>User Name</TableHead><TableHead>Email</TableHead><TableHead>Join Date</TableHead><TableHead>Courses</TableHead><TableHead className="text-right">Total Spent</TableHead><TableHead className="text-right">Details</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow><TableCell colSpan={6} className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></TableCell></TableRow>
                            )}
                            {isError && (
                                <TableRow><TableCell colSpan={6} className="text-center text-red-500 p-8 flex items-center justify-center gap-2"><AlertTriangle className="h-5 w-5" /> Failed to load users.</TableCell></TableRow>
                            )}
                            {!isLoading && !isError && users.map((user) => (
                                <TableRow key={user._id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell><Badge variant="outline">{user.enrolledCourses.length} Purchased</Badge></TableCell>
                                    <TableCell className="text-right font-bold text-green-600">₹{user.totalSpent.toLocaleString('en-IN')}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}>View</Button>
                                    </TableCell>
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