// adminApi.ts - This file simulates fetching data from your backend.

/**
 * Interface definitions for the data structures returned by the API
 */
export interface AdminAnalyticsData {
  totalRevenue: number;
  revenueChange: number; // Percentage change vs last period
  newUsers: number;
  userChange: number; // Percentage change vs last period
  avgCompletionRate: number;
  activeLearners: number;
}

export interface Course {
  id: number;
  title: string;
  instructor: string;
  enrollments: number;
  completionRate: number; // Percentage
  price: number;
}

export interface InstructorPerformance {
  instructor: string;
  enrollments: number;
}

export interface EnrollmentTrend {
  month: string;
  registrations: number;
  enrollments: number;
}

export interface CategoryRevenue {
  name: string;
  value: number; // Revenue amount
}

export interface RevenueTrend {
  month: string;
  revenue: number;
}

export interface RecentActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  type: string;
}

export interface PlatformPerformance {
  activeSessions: number;
  avgSessionDuration: string;
  courseCompletionRate: number;
  userSatisfaction: string;
}

export interface MonthlyComparison {
  newEnrollmentsChange: number; // Percentage
  revenueGrowth: number; // Percentage
  userRetentionChange: number; // Percentage
  courseCompletionsChange: number; // Percentage
}

// --- Simulated Mock Data (Replace this with your actual API response structure) ---

const mockAdminAnalytics: AdminAnalyticsData = {
  totalRevenue: 3456789,
  revenueChange: 12.5,
  newUsers: 1450,
  userChange: 8.2,
  avgCompletionRate: 68,
  activeLearners: 5200,
};

const mockAdminCourses: Course[] = [
  { id: 1, title: 'React Masterclass', instructor: 'Alice Johnson', enrollments: 12500, completionRate: 75, price: 4999 },
  { id: 2, title: 'Advanced TypeScript', instructor: 'Bob Williams', enrollments: 8900, completionRate: 62, price: 3499 },
  { id: 3, title: 'GraphQL Fundamentals', instructor: 'Charlie Brown', enrollments: 5500, completionRate: 88, price: 2999 },
  { id: 4, title: 'Cloud DevOps Pro', instructor: 'Alice Johnson', enrollments: 3200, completionRate: 45, price: 5999 },
  { id: 5, title: 'UX/UI Design Basics', instructor: 'David Lee', enrollments: 2100, completionRate: 92, price: 1999 },
  { id: 6, title: 'Mobile App Development', instructor: 'Bob Williams', enrollments: 1800, completionRate: 50, price: 3999 },
];

const mockInstructorPerformance: InstructorPerformance[] = [
  { instructor: 'Alice Johnson', enrollments: 15700 }, 
  { instructor: 'Bob Williams', enrollments: 10700 }, 
  { instructor: 'Charlie Brown', enrollments: 5500 },
  { instructor: 'David Lee', enrollments: 2100 },
];

const mockEnrollmentTrend: EnrollmentTrend[] = [
  { month: 'Jan', registrations: 1200, enrollments: 800 },
  { month: 'Feb', registrations: 1500, enrollments: 1000 },
  { month: 'Mar', registrations: 1400, enrollments: 1100 },
  { month: 'Apr', registrations: 1800, enrollments: 1300 },
  { month: 'May', registrations: 2200, enrollments: 1600 },
  { month: 'Jun', registrations: 2500, enrollments: 1800 },
];

const mockCategoryRevenue: CategoryRevenue[] = [
  { name: 'Development', value: 1800000 },
  { name: 'Design', value: 900000 },
  { name: 'Marketing', value: 756789 },
];

const mockRevenueTrend: RevenueTrend[] = [
  { month: 'Jan', revenue: 400000 },
  { month: 'Feb', revenue: 300000 },
  { month: 'Mar', revenue: 550000 },
  { month: 'Apr', revenue: 450000 },
  { month: 'May', revenue: 600000 },
  { month: 'Jun', revenue: 750000 },
];

const mockRecentActivities: RecentActivity[] = [
  { id: 1, user: 'John Doe', action: 'enrolled in React Masterclass', time: '2 hours ago', type: 'enrollment' },
  { id: 2, user: 'Jane Smith', action: 'completed Python Fundamentals', time: '5 hours ago', type: 'completion' },
  { id: 3, user: 'Mike Johnson', action: 'left feedback on Web Development', time: '1 day ago', type: 'feedback' },
  { id: 4, user: 'Sarah Williams', action: 'purchased Data Science Course', time: '1 day ago', type: 'purchase' },
];

const mockPlatformPerformance: PlatformPerformance = {
  activeSessions: 234,
  avgSessionDuration: '24 min',
  courseCompletionRate: 68,
  userSatisfaction: '4.8/5',
};

const mockMonthlyComparison: MonthlyComparison = {
  newEnrollmentsChange: 15.3,
  revenueGrowth: 12.5,
  userRetentionChange: 8.7,
  courseCompletionsChange: 5.3,
};


// --- API Functions: Replace these with your actual server calls ---

/**
 * Fetches all necessary data for the AdminAnalytics dashboard.
 * @returns An object containing all analytics data points.
 */
export const fetchAdminAnalyticsData = async () => {
  // 🚨 REPLACE THIS WITH YOUR ACTUAL API CALL (e.g., fetch('/api/admin/analytics'))
  await new Promise(resolve => setTimeout(resolve, 1000));

  const topCourses = mockAdminCourses
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 5);
  
  return {
    analytics: mockAdminAnalytics,
    topCourses: topCourses,
    revenueTrendData: mockRevenueTrend,
    instructorData: mockInstructorPerformance,
    enrollmentTrendData: mockEnrollmentTrend,
    categoryRevenueData: mockCategoryRevenue,
  };
};

/**
 * Fetches all necessary data for the AdminDashboard overview.
 * @returns An object containing quick stats and list data.
 */
export const fetchAdminDashboardData = async () => {
  // 🚨 REPLACE THIS WITH YOUR ACTUAL API CALL (e.g., fetch('/api/admin/dashboard'))
  await new Promise(resolve => setTimeout(resolve, 800));

  const topCourses = mockAdminCourses
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 3);
    
  // Mock calculation to derive simple stats from analytics data
  const totalUsers = mockAdminAnalytics.newUsers * 10 + 5000; 
  const totalCourses = mockAdminCourses.length;
  const totalRevenue = mockAdminAnalytics.totalRevenue;
  
  // Dynamic stats array structure (will be mapped in the component)
  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      change: `+${mockAdminAnalytics.revenueChange}%`,
      changeType: mockAdminAnalytics.revenueChange >= 0 ? 'positive' : 'negative',
      description: 'from course sales',
    },
    {
      title: 'Total Users',
      value: totalUsers.toString(),
      change: `+${mockAdminAnalytics.userChange}%`,
      changeType: mockAdminAnalytics.userChange >= 0 ? 'positive' : 'negative',
      description: 'registered users',
    },
    {
      title: 'Active Courses',
      value: totalCourses.toString(),
      change: '+3 new', 
      changeType: 'positive',
      description: 'available courses',
    },
    {
      title: 'Avg. Completion',
      value: `${mockAdminAnalytics.avgCompletionRate}%`,
      change: `+${mockMonthlyComparison.courseCompletionsChange}%`,
      changeType: 'positive',
      description: 'completion rate',
    },
  ];

  return {
    stats,
    recentActivities: mockRecentActivities,
    topCourses: topCourses,
    platformPerformance: mockPlatformPerformance,
    monthlyComparison: mockMonthlyComparison,
    // Add other aggregated data if needed
  };
};