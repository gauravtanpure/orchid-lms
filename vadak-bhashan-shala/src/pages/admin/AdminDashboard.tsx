import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, BookOpen, TrendingUp, User, ArrowUpRight, Activity } from 'lucide-react';
// --- IMPORT FIX: Use relative path for API utility ---
import { 
  fetchAdminDashboardData, 
  Course, 
  RecentActivity,
  PlatformPerformance,
  MonthlyComparison
} from '../../api/adminApi'; 


// Define a type for the dynamic stat objects (will be created in the hook)
interface DashboardStat {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: typeof DollarSign | typeof Users | typeof BookOpen | typeof TrendingUp;
  bgColor: string;
  description: string;
}

// Define the shape of the fetched state
interface DashboardState {
  stats: DashboardStat[];
  recentActivities: RecentActivity[];
  topCourses: Course[];
  platformPerformance: PlatformPerformance | null;
  monthlyComparison: MonthlyComparison | null;
  loading: boolean;
  error: string | null;
}

const initialDashboardState: DashboardState = {
  stats: [],
  recentActivities: [],
  topCourses: [],
  platformPerformance: null,
  monthlyComparison: null,
  loading: true,
  error: null,
};

// --- Icons mapping for stats ---
const StatIcons = {
  'Total Revenue': DollarSign,
  'Total Users': Users,
  'Active Courses': BookOpen,
  'Avg. Completion': TrendingUp,
};

// --- Custom Hook to Fetch Data ---
const useAdminDashboardData = () => {
  const [dataState, setDataState] = useState<DashboardState>(initialDashboardState);

  useEffect(() => {
    const getData = async () => {
      try {
        const fetchedData = await fetchAdminDashboardData();
        
        // Map the fetched simple stat objects to include the required icon component
        const finalStats: DashboardStat[] = fetchedData.stats.map(stat => {
          const IconComponent = StatIcons[stat.title as keyof typeof StatIcons];
          const bgColorMap: { [key: string]: string } = {
            'Total Revenue': 'bg-gradient-to-br from-green-500 to-green-600',
            'Total Users': 'bg-gradient-to-br from-blue-500 to-blue-600',
            'Active Courses': 'bg-gradient-to-br from-purple-500 to-purple-600',
            'Avg. Completion': 'bg-gradient-to-br from-orange-500 to-orange-600',
          };

          return {
            ...stat,
            icon: IconComponent,
            bgColor: bgColorMap[stat.title] || 'bg-gray-500', 
          };
        });

        setDataState({
          ...fetchedData,
          stats: finalStats,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setDataState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to load dashboard data.' 
        }));
      }
    };
    getData();
  }, []);

  return dataState;
};

// --- Loading State Component ---
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
      <div className="lg:col-span-1 h-96 bg-gray-200 rounded-xl"></div>
    </div>
    <div className="grid gap-6 md:grid-cols-2">
        <div className="h-48 bg-gray-200 rounded-xl"></div>
        <div className="h-48 bg-gray-200 rounded-xl"></div>
    </div>
  </div>
);


const AdminDashboard: React.FC = () => {
  const { 
    stats, 
    recentActivities, 
    topCourses, 
    platformPerformance, 
    monthlyComparison, 
    loading, 
    error 
  } = useAdminDashboardData();

  if (loading) {
    return <div className="p-4 md:p-8 space-y-8"><LoadingSkeleton /></div>;
  }

  if (error) {
    return <div className="p-4 md:p-8 text-center text-red-600 border border-red-200 bg-red-50 rounded-lg">Error: {error}</div>;
  }
  
  // Helper to determine the text color based on positive/negative change
  const getChangeColor = (value: number | string, isPositive=true) => {
    const val = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g,"")) : value;
    if (isNaN(val)) return 'text-gray-500';
    return (isPositive ? (val >= 0 ? 'text-green-600' : 'text-red-600') : (val >= 0 ? 'text-red-600' : 'text-green-600'));
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
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

      {/* Two Column Layout: Recent Activity & Top Courses */}
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
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
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
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity.</p>
                )}
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
                {topCourses.length > 0 ? (
                  topCourses.map((course, index) => (
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
                          {course.enrollments.toLocaleString()} enrollments
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No top courses yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats & Monthly Comparison */}
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
                <span className="text-sm font-bold text-gray-900">{platformPerformance?.activeSessions.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Session Duration</span>
                <span className="text-sm font-bold text-gray-900">{platformPerformance?.avgSessionDuration || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Course Completion Rate</span>
                <span className={`text-sm font-bold ${getChangeColor(platformPerformance?.courseCompletionRate || 0)}`}>{platformPerformance?.courseCompletionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User Satisfaction</span>
                <span className={`text-sm font-bold ${getChangeColor(platformPerformance?.userSatisfaction || '0', true)}`}>{platformPerformance?.userSatisfaction || 'N/A'}</span>
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
                <span className={`text-sm font-bold ${getChangeColor(monthlyComparison?.newEnrollmentsChange || 0)}`}>
                  {monthlyComparison?.newEnrollmentsChange >= 0 ? '+' : ''}{monthlyComparison?.newEnrollmentsChange}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue Growth</span>
                <span className={`text-sm font-bold ${getChangeColor(monthlyComparison?.revenueGrowth || 0)}`}>
                  {monthlyComparison?.revenueGrowth >= 0 ? '+' : ''}{monthlyComparison?.revenueGrowth}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User Retention</span>
                <span className={`text-sm font-bold ${getChangeColor(monthlyComparison?.userRetentionChange || 0)}`}>
                  {monthlyComparison?.userRetentionChange >= 0 ? '+' : ''}{monthlyComparison?.userRetentionChange}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Course Completions</span>
                <span className={`text-sm font-bold ${getChangeColor(monthlyComparison?.courseCompletionsChange || 0)}`}>
                  {monthlyComparison?.courseCompletionsChange >= 0 ? '+' : ''}{monthlyComparison?.courseCompletionsChange}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;