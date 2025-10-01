import React, { useState, useEffect } from 'react'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Activity, TrendingUp, Waypoints } from 'lucide-react';
import { 
  mockAdminCourses, 
  mockAdminAnalytics, 
  mockInstructorPerformance,
  mockEnrollmentTrend, 
  mockCategoryRevenue 
} from '@/data/adminMockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
// Importing Recharts components
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, BarChart as RechartsBarChart, AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';


// --- Custom Hook to fix Recharts rendering issue ---
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
};


// --- Data Preparation ---
const analytics = mockAdminAnalytics;
const topCourses = mockAdminCourses
  .sort((a, b) => b.enrollments - a.enrollments)
  .slice(0, 5);

const revenueTrendData = [
  { month: 'Jan', revenue: 400000 },
  { month: 'Feb', revenue: 300000 },
  { month: 'Mar', revenue: 550000 },
  { month: 'Apr', revenue: 450000 },
  { month: 'May', revenue: 600000 },
  { month: 'Jun', revenue: 750000 },
];
const instructorData = mockInstructorPerformance;
const enrollmentTrendData = mockEnrollmentTrend;
const categoryRevenueData = mockCategoryRevenue;

// Light, Formal Color Palette for Pie Chart (Corporate Theme)
const PIE_COLORS = ['#0EA5E9', '#F59E0B', '#14B8A6']; 


// --- Chart Components ---
const RevenueChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={revenueTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
      <XAxis dataKey="month" stroke="#333" />
      <YAxis
        tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
        stroke="#333"
      />
      <Tooltip
        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
        labelFormatter={(label) => `Month: ${label}`}
        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
      />
      <Legend wrapperStyle={{ paddingTop: '10px' }} />
      {/* Light Color: Sky-500 */}
      <Line type="monotone" dataKey="revenue" stroke="#0EA5E9" strokeWidth={3} activeDot={{ r: 8 }} />
    </LineChart>
  </ResponsiveContainer>
);

const InstructorChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <RechartsBarChart data={instructorData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
      <XAxis dataKey="instructor" stroke="#333" />
      <YAxis stroke="#333" />
      <Tooltip
        formatter={(value: number) => [value, 'Total Enrollments']}
        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
      />
      <Legend wrapperStyle={{ paddingTop: '10px' }} />
      {/* Light Color: Blue-500 */}
      <Bar dataKey="enrollments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
    </RechartsBarChart>
  </ResponsiveContainer>
);

const ConversionChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={enrollmentTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      {/* Light Color: Teal line, very light Teal fill */}
      <Area type="monotone" dataKey="registrations" stackId="1" stroke="#14B8A6" fill="#E0F2F1" name="New Registrations" />
      {/* Light Color: Sky line, very light Sky fill */}
      <Area type="monotone" dataKey="enrollments" stackId="1" stroke="#0EA5E9" fill="#E0F7FA" name="Course Enrollments" />
      <Legend wrapperStyle={{ paddingTop: '10px' }} />
    </AreaChart>
  </ResponsiveContainer>
);

const CategoryPieChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
      <Pie
        data={categoryRevenueData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        fill="#8884d8"
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
      >
        {categoryRevenueData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value: number, name: string) => [`₹${value.toLocaleString('en-IN')}`, name]} />
      <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '10px' }} />
    </PieChart>
  </ResponsiveContainer>
);


// --- Main Component ---
const AdminAnalytics: React.FC = () => {
  const isClient = useIsClient();

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900 tracking-tight border-b pb-2">
        📊 Platform Dashboard
      </h1>

      {/* Metric Cards - Using Muted Corporate Colors */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card (Muted Success) */}
        <Card className="shadow-lg border-l-4 border-emerald-400 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">TOTAL REVENUE</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">
              ₹{analytics.totalRevenue.toLocaleString('en-IN')}
            </div>
            <p className={`text-xs mt-1 ${analytics.revenueChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {analytics.revenueChange >= 0 ? '+' : ''}{analytics.revenueChange}% vs last month
            </p>
          </CardContent>
        </Card>

        {/* New Users Card (Muted Information) */}
        <Card className="shadow-lg border-l-4 border-sky-400 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">NEW USERS</CardTitle>
            <Users className="h-5 w-5 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">+{analytics.newUsers}</div>
            <p className={`text-xs mt-1 ${analytics.userChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {analytics.userChange >= 0 ? '+' : ''}{analytics.userChange}% vs last month
            </p>
          </CardContent>
        </Card>

        {/* Avg. Completion Rate Card (Muted Warning/Tracking) */}
        <Card className="shadow-lg border-l-4 border-amber-400 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">AVG. COMPLETION RATE</CardTitle>
            <TrendingUp className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{analytics.avgCompletionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all active courses
            </p>
          </CardContent>
        </Card>

        {/* Active Learners Card (Muted Activity) */}
        <Card className="shadow-lg border-l-4 border-indigo-400 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">ACTIVE LEARNERS</CardTitle>
            <Activity className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{analytics.activeLearners}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Learners active in the last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Primary Charts (Section 2) */}
      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">💰 Revenue Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] p-6">
            {isClient ? (<RevenueChart />) : (<div className="flex h-full items-center justify-center text-muted-foreground">Loading chart...</div>)}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">⭐ Top Instructor Performance (Enrollments)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] p-6">
            {isClient ? (<InstructorChart />) : (<div className="flex h-full items-center justify-center text-muted-foreground">Loading chart...</div>)}
          </CardContent>
        </Card>
      </div>
      
      {/* Informative Charts (Section 3) */}
      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">🎯 User Conversion Funnel (Reg. vs. Enroll)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] p-6">
            {isClient ? (<ConversionChart />) : (<div className="flex h-full items-center justify-center text-muted-foreground">Loading chart...</div>)}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">🏷️ Revenue Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] p-6">
            {isClient ? (<CategoryPieChart />) : (<div className="flex h-full items-center justify-center text-muted-foreground">Loading chart...</div>)}
          </CardContent>
        </Card>
      </div>


      {/* Top Performing Courses Table (Section 4) */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">🏆 Top 5 Courses by Enrollment</h2>
        <Card className="shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50 border-b">
                <TableRow>
                  <TableHead className="w-[40%] text-left font-bold text-gray-700">Course Title</TableHead>
                  <TableHead className="w-[20%] font-bold text-gray-700">Instructor</TableHead>
                  <TableHead className="w-[20%] font-bold text-gray-700">Total Enrollment</TableHead>
                  <TableHead className="w-[20%] text-right font-bold text-gray-700">Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCourses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-blue-50/50 transition-colors">
                    <TableCell className="font-semibold text-gray-800">{course.title}</TableCell>
                    <TableCell className="text-gray-600">{course.instructor}</TableCell>
                    <TableCell className="font-medium">{course.enrollments.toLocaleString()}</TableCell>
                    <TableCell className="text-right flex flex-col items-end">
                      {/* Using muted blue for progress bar */}
                      <Progress value={course.completionRate || 0} className="h-2 w-3/4 mb-1 bg-gray-200" indicatorClassName="bg-sky-500" />
                      <span className="text-xs font-medium text-sky-600 mt-0.5">
                        {course.completionRate || 0}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;