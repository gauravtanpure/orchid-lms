// /backend/src/controllers/adminController.js

import User from '../models/User.js';
// 🚨 You will likely need to import other models here:
// import Course from '../models/Course.js'; 
// import Order from '../models/Order.js'; 


/**
 * @desc Get key summary data for the AdminDashboard.tsx overview
 * @route GET /api/admin/dashboard-summary
 * @access Private/Admin
 */
export const getAdminDashboardSummary = async (req, res) => {
  try {
    // --------------------------------------------------------------------------
    // 🚨 ACTION REQUIRED: REPLACE THIS MOCK BLOCK WITH REAL DB AGGREGATION 🚨

    // Use actual DB operations to get counts, sums, and recent activity
    const totalUsersCount = await User.countDocuments();
    
    // TEMPORARY MOCK DATA STRUCTURE:
    const dashboardData = {
      // Metric Card Data
      totalRevenue: 4050000, 
      revenueChange: 15.3,   
      totalUsers: totalUsersCount,
      userChange: 9.1,       
      activeCourses: 50,     
      avgCompletionRate: 68,
      completionChange: 6.5,
      
      // List/Component Data
      topCourses: [ 
          { id: 1, title: 'Real React Course', enrollments: 14500 }, 
          { id: 2, title: 'Real TypeScript Pro', enrollments: 9100 }, 
          { id: 3, title: 'Real GraphQL Basics', enrollments: 6200 }
      ],
      recentActivities: [ 
        { id: 1, user: 'John Doe', action: 'enrolled in React Masterclass', time: '2 hours ago', type: 'enrollment' },
        { id: 2, user: 'Jane Smith', action: 'completed Python Fundamentals', time: '5 hours ago', type: 'completion' },
      ],
      platformPerformance: {
        activeSessions: 350,
        avgSessionDuration: '28 min', 
        courseCompletionRate: 68,
        userSatisfaction: '4.9/5', 
      },
      monthlyComparison: {
        newEnrollmentsChange: 15.3,
        revenueGrowth: 15.3,
        userRetentionChange: 8.7,
        courseCompletionsChange: 6.5,
      }
    };
    // --------------------------------------------------------------------------

    res.status(200).json(dashboardData);

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: 'Server error fetching dashboard summary.' });
  }
};


/**
 * @desc Get detailed data for the AdminAnalytics.tsx page (charts and detailed tables)
 * @route GET /api/admin/analytics-summary
 * @access Private/Admin
 */
export const getAdminAnalyticsSummary = async (req, res) => {
  try {
    // --------------------------------------------------------------------------
    // 🚨 ACTION REQUIRED: REPLACE THIS MOCK BLOCK WITH REAL DB AGGREGATION 🚨

    // TEMPORARY MOCK DATA STRUCTURE:
    const analyticsData = {
        // Key metrics for the metric cards (frontend expects this as 'analytics')
        keyMetrics: { 
            totalRevenue: 4123450,
            revenueChange: 18.0,
            newUsers: 1800,
            userChange: 10.5,
            avgCompletionRate: 71,
            activeLearners: 6500,
        },
        
        // Data for charts and tables
        topCourses: [ /* Array of 5 detailed Course objects */ ],
        revenueTrend: [ /* Array of { month: 'X', revenue: N } objects for LineChart */ ],
        instructorPerformance: [ /* Array of { instructor: 'X', enrollments: N } objects for BarChart */ ],
        enrollmentConversion: [ /* Array of { month: 'X', registrations: N, enrollments: M } objects for AreaChart */ ],
        revenueByCategory: [ /* Array of { name: 'X', value: N } objects for PieChart */ ],
    };

    // --------------------------------------------------------------------------

    res.status(200).json(analyticsData);

  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ message: 'Server error fetching analytics summary.' });
  }
};