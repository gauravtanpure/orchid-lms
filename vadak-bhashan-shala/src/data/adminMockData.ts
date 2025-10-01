// --- 1. ADMIN ANALYTICS MOCK DATA ---
export const mockAdminAnalytics = {
    totalRevenue: 2895000,
    revenueChange: 12.5, // % vs last month
    newUsers: 450,
    userChange: 8.2, // % vs last month
    avgCompletionRate: 45, // %
    activeLearners: 1200,
};

// --- 2. USER FEEDBACK MOCK DATA ---
export const mockUserFeedback = [
    { id: 'f1', userId: 'u3', userName: 'Priya Sharma', subject: 'Video quality issue on mobile', message: 'The video player buffers frequently when viewed on an Android device.', date: '2025-10-01', status: 'New' as const, rating: 4 },
    { id: 'f2', userId: 'u1', userName: 'Amit Patel', subject: 'Request for a new course: Data Science', message: 'The existing python course is great! Could you consider a follow-up Data Science track?', date: '2025-09-28', status: 'Resolved' as const, rating: 5 },
    { id: 'f3', userId: 'u2', userName: 'Sneha Rao', subject: 'Password reset link not working', message: 'I tried to reset my password but the link in the email leads to a 404 page.', date: '2025-09-25', status: 'In Progress' as const, rating: 3 },
];

// --- 3. COURSE DEFINITIONS (UPDATED WITH TRACKING) ---
export const mockAdminCourses = [
    { id: 'c1', title: 'Foundational Web Development with React', instructor: 'Dr. R. K. Singh', category: 'Tech', price: 15000, duration: 40, enrollments: 850, completionRate: 65 },
    { id: 'c2', title: 'Mastering Professional English Communication', instructor: 'Ms. A. V. Iyer', category: 'Language', price: 8000, duration: 25, enrollments: 1200, completionRate: 35 },
    { id: 'c3', title: 'Advanced Python for Machine Learning', instructor: 'Bhavik Jha', category: 'Tech', price: 25000, duration: 60, enrollments: 500, completionRate: 80 },
    { id: 'c4', title: 'Financial Modeling & Valuation', instructor: 'Chetan Bansal', category: 'Finance', price: 12000, duration: 30, enrollments: 300, completionRate: 20 },
];

// --- 4. USER DEFINITIONS ---
export const mockAdminUsers = [
    { id: 'u1', name: 'Amit Patel', email: 'amit@example.com', role: 'user', joinDate: '2025-08-10', enrolledCourses: ['c1', 'c3'] },
    { id: 'u2', name: 'Sneha Rao', email: 'sneha@example.com', role: 'user', joinDate: '2025-09-01', enrolledCourses: ['c2'] },
    { id: 'u3', name: 'Priya Sharma', email: 'priya@example.com', role: 'user', joinDate: '2025-07-20', enrolledCourses: ['c1', 'c2', 'c4'] },
    { id: 'u4', name: 'Admin User', email: 'admin@edutrack.com', role: 'admin', joinDate: '2025-07-01', enrolledCourses: [] },
];

// --- 5. USER PAYMENTS MOCK DATA ---
export const mockUserPayments = [
    { userId: 'u1', courseId: 'c1', amount: 15000, date: '2025-08-10', transactionId: 'TXN-0001' },
    { userId: 'u1', courseId: 'c3', amount: 25000, date: '2025-09-05', transactionId: 'TXN-0005' },
    { userId: 'u2', courseId: 'c2', amount: 8000, date: '2025-09-01', transactionId: 'TXN-0002' },
    { userId: 'u3', courseId: 'c1', amount: 15000, date: '2025-07-20', transactionId: 'TXN-0003' },
    { userId: 'u3', courseId: 'c2', amount: 8000, date: '2025-07-20', transactionId: 'TXN-0004' },
    { userId: 'u3', courseId: 'c4', amount: 12000, date: '2025-10-01', transactionId: 'TXN-0006' },
];

// --- 6. INSTRUCTOR PERFORMANCE MOCK DATA ---
export const mockInstructorPerformance = [
    { instructor: 'Ms. A. V. Iyer', enrollments: 1200 }, 
    { instructor: 'Dr. R. K. Singh', enrollments: 850 }, 
    { instructor: 'Bhavik Jha', enrollments: 500 }, 
    { instructor: 'Chetan Bansal', enrollments: 300 }, 
];

// --- 7. NEW: ENROLLMENT VS REGISTRATION TREND (for Area Chart) ---
export const mockEnrollmentTrend = [
  { month: 'Mar', registrations: 120, enrollments: 80 },
  { month: 'Apr', registrations: 150, enrollments: 95 },
  { month: 'May', registrations: 135, enrollments: 105 },
  { month: 'Jun', registrations: 180, enrollments: 110 },
  { month: 'Jul', registrations: 210, enrollments: 150 },
  { month: 'Aug', registrations: 250, enrollments: 175 },
];

// --- 8. NEW: REVENUE BREAKDOWN BY CATEGORY (for Pie Chart) ---
export const mockCategoryRevenue = [
  { name: 'Tech', revenue: 15000 * 850 + 25000 * 500, value: 25000000, color: '#F59E0B' }, // Yellow-500
  { name: 'Language', revenue: 8000 * 1200, value: 9600000, color: '#3B82F6' }, // Blue-500
  { name: 'Finance', revenue: 12000 * 300, value: 3600000, color: '#10B981' }, // Green-500
];