import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Users, BookOpen } from 'lucide-react';
import { mockAdminCourses, mockAdminUsers } from '@/data/adminMockData';

const AdminDashboard: React.FC = () => {
  // Calculate stats from mock data
  const totalUsers = mockAdminUsers.length;
  const totalCourses = mockAdminCourses.length;
  const totalRevenue = mockAdminUsers
    .flatMap(user => user.enrolledCourses)
    .map(courseId => mockAdminCourses.find(c => c.id === courseId)?.price || 0)
    .reduce((sum, price) => sum + price, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">from all course sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalUsers}</div>
            <p className="text-xs text-muted-foreground">registered on the platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">available for enrollment</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        {/* You can add charts or recent activity logs here */}
        <h2 className="text-xl font-semibold">Recent Activity (Placeholder)</h2>
        <Card className="mt-4">
          <CardContent className="p-6">
            <p className="text-muted-foreground">Activity feed will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;