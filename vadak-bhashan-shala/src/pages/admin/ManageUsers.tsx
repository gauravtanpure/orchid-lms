import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, UserCheck } from 'lucide-react';
import { mockAdminUsers, mockAdminCourses, mockUserPayments } from '@/data/adminMockData';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

// Define the shape of a User (assuming a 'totalSpent' property for quick view)
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  enrolledCourses: string[];
  totalSpent: number; // New quick-view metric
}

// Combine mock data and calculate totalSpent
const usersWithSpending: User[] = mockAdminUsers.map(user => {
    const totalSpent = mockUserPayments
        .filter(p => p.userId === user.id)
        .reduce((sum, payment) => sum + payment.amount, 0);
    return { ...user, totalSpent };
});


// Component for the User Detail/Payment View
const UserDetailsDialog: React.FC<{ user: User, courses: any[] }> = ({ user, courses }) => {
    const userPayments = mockUserPayments.filter(p => p.userId === user.id);

    return (
        <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="text-lg font-semibold mb-2">General Info</h3>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Join Date:</strong> {user.joinDate}</p>
                    <p><strong>Total Spent:</strong> <span className="font-bold text-green-600">₹{user.totalSpent.toLocaleString('en-IN')}</span></p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Purchased Courses ({user.enrolledCourses.length})</h3>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-2">
                        {user.enrolledCourses.map(courseId => (
                            <Badge key={courseId} variant="secondary">
                                {courses.find(c => c.id === courseId)?.title || 'Unknown Course'}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-semibold mt-4 border-t pt-4">Payment Transaction History</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Transaction ID</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {userPayments.map(payment => (
                        <TableRow key={payment.transactionId}>
                            <TableCell className="font-medium">{courses.find(c => c.id === payment.courseId)?.title || 'N/A'}</TableCell>
                            <TableCell className="text-green-600 font-semibold">₹{payment.amount.toLocaleString('en-IN')}</TableCell>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{payment.transactionId}</TableCell>
                        </TableRow>
                    ))}
                    {userPayments.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No purchases found for this user.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

const ManageUsers: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const getCourseTitle = (courseId: string) => {
        return mockAdminCourses.find(c => c.id === courseId)?.title || 'Unknown Course';
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">User & Payment Management</h1>
            
            {/* User Detail Dialog */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-primary" /> User Profile & Transactions
                        </DialogTitle>
                        <DialogDescription>
                            Detailed information, purchased courses, and complete payment history for the user.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && <UserDetailsDialog user={selectedUser} courses={mockAdminCourses} />}
                </DialogContent>
            </Dialog>

            <Card className="shadow-lg">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Join Date</TableHead>
                                <TableHead>Courses</TableHead>
                                {/* New Payment Tracking Column */}
                                <TableHead className="text-right">Total Spent</TableHead>
                                <TableHead className="text-right">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usersWithSpending.map((user) => (
                                <TableRow key={user.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.joinDate}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs">
                                            {user.enrolledCourses.length} Purchased
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-green-600">
                                        ₹{user.totalSpent.toLocaleString('en-IN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}>
                                            View
                                        </Button>
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