import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockAdminUsers, mockAdminCourses } from '@/data/adminMockData';

const ManageUsers: React.FC = () => {
  const getCourseTitle = (courseId: string) => {
    return mockAdminCourses.find(c => c.id === courseId)?.title || 'Unknown Course';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Purchased Courses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAdminUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.enrolledCourses.length > 0 ? (
                        user.enrolledCourses.map(courseId => (
                          <Badge key={courseId} variant="secondary">
                            {getCourseTitle(courseId)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No courses</span>
                      )}
                    </div>
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