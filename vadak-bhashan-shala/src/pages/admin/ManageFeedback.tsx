import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockUserFeedback } from '@/data/adminMockData';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';

// Define the shape of a feedback item
interface Feedback {
    id: string;
    userId: string;
    userName: string;
    subject: string;
    message: string;
    date: string;
    status: 'New' | 'In Progress' | 'Resolved';
    rating: number;
}

const getStatusBadge = (status: Feedback['status']) => {
    switch (status) {
        case 'New':
            return <Badge variant="destructive" className="flex items-center gap-1"><Clock className="h-3 w-3" /> New</Badge>;
        case 'In Progress':
            return <Badge variant="secondary" className="flex items-center gap-1">In Progress</Badge>;
        case 'Resolved':
            return <Badge variant="default" className="bg-green-500 hover:bg-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Resolved</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

const ManageFeedback: React.FC = () => {
    // Sort feedback to show 'New' first
    const sortedFeedback = mockUserFeedback.sort((a, b) => {
        if (a.status === 'New' && b.status !== 'New') return -1;
        if (a.status !== 'New' && b.status === 'New') return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const handleViewFeedback = (feedback: Feedback) => {
        alert(`Subject: ${feedback.subject}\nUser: ${feedback.userName}\nMessage: ${feedback.message}`);
        // In a real app, this would open a dialog to view the full message and change the status.
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">User Feedback & Inquiries</h1>
            <Card className="shadow-lg">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedFeedback.map((feedback) => (
                                <TableRow key={feedback.id} className={feedback.status === 'New' ? 'bg-red-50/50 hover:bg-red-100/50' : ''}>
                                    <TableCell className="font-medium">{feedback.userName}</TableCell>
                                    <TableCell className="max-w-[300px] truncate">{feedback.subject}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{feedback.date}</TableCell>
                                    <TableCell>{'⭐'.repeat(feedback.rating)}</TableCell>
                                    <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleViewFeedback(feedback)}>
                                            <MessageSquare className="h-4 w-4 mr-2" /> View
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

export default ManageFeedback;