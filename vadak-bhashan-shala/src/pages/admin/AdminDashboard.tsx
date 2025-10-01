import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, BookOpen, TrendingUp, User, ArrowUpRight, Activity } from 'lucide-react';
import { mockAdminCourses, mockAdminUsers } from '@/data/adminMockData';

const AdminDashboard: React.FC = () => {
  const totalUsers = mockAdminUsers.length;
  const totalCourses = mockAdminCourses.length;
  const totalRevenue = mockAdminUsers
    .flatMap((user) => user.enrolledCourses)
    .map((courseId) => mockAdminCourses.find((c) => c.id === courseId)?.price || 0)
    .reduce((sum, price) => sum + price, 0);

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
      description: 'from course sales',
    },
    {
      title: 'Total Users',
      value: totalUsers.toString(),
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      description: 'registered users',
    },
    {
      title: 'Active Courses',
      value: totalCourses.toString(),
      change: '+3 new',
      changeType: 'positive',
      icon: BookOpen,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      description: 'available courses',
    },
    {
      title: 'Avg. Completion',
      value: '68%',
      change: '+5.3%',
      changeType: 'positive',
      icon: TrendingUp,
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
      description: 'completion rate',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: 'John Doe',
      action: 'enrolled in React Masterclass',
      time: '2 hours ago',
      type: 'enrollment',
    },
    {
      id: 2,
      user: 'Jane Smith',
      action: 'completed Python Fundamentals',
      time: '5 hours ago',
      type: 'completion',
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'left feedback on Web Development',
      time: '1 day ago',
      type: 'feedback',
    },
    {
      id: 4,
      user: 'Sarah Williams',
      action: 'purchased Data Science Course',
      time: '1 day ago',
      type: 'purchase',
    },
  ];

  const topCourses = mockAdminCourses
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span
                  className={`text-sm font-semibold flex items-center gap-1 ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </CardTitle>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="font-semibold">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Courses - Takes 1 column */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Top Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {topCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {course.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {course.enrollments} enrollments
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Platform Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="text-sm font-bold text-gray-900">234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Session Duration</span>
                <span className="text-sm font-bold text-gray-900">24 min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Course Completion Rate</span>
                <span className="text-sm font-bold text-green-600">68%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User Satisfaction</span>
                <span className="text-sm font-bold text-green-600">4.8/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Monthly Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Enrollments</span>
                <span className="text-sm font-bold text-green-600">+15.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue Growth</span>
                <span className="text-sm font-bold text-green-600">+12.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User Retention</span>
                <span className="text-sm font-bold text-green-600">+8.7%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Course Completions</span>
                <span className="text-sm font-bold text-green-600">+5.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;