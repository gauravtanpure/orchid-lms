// All courses available in the system
export const mockAdminCourses = [
  {
    id: 'course-101',
    title: 'Advanced Public Speaking for Professionals',
    instructor: 'Dr. Anjali Deshmukh',
    category: 'marathi',
    price: 4999,
    duration: 20, // in hours
    enrollments: 120,
  },
  {
    id: 'course-999',
    title: 'Free Intro to Communication Skills',
    instructor: 'Ms. Priya Patil',
    category: 'english',
    price: 0,
    duration: 5,
    enrollments: 350,
  },
  {
    id: 'course-202',
    title: 'English Fluency: From Basics to Business',
    instructor: 'Mr. Rohan Kulkarni',
    category: 'english',
    price: 3499,
    duration: 35,
    enrollments: 215,
  },
  {
    id: 'course-303',
    title: 'The Art of Persuasion and Negotiation',
    instructor: 'Ms. Priya Patil',
    category: 'english',
    price: 2999,
    duration: 15,
    enrollments: 85,
  },
];

// List of all users in the system
export const mockAdminUsers = [
  {
    id: 'user-001',
    name: 'Demo User',
    email: 'demo@user.com',
    joinDate: '2025-01-15',
    enrolledCourses: ['course-101'],
  },
  {
    id: 'user-002',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    joinDate: '2025-02-20',
    enrolledCourses: ['course-202', 'course-303'],
  },
  {
    id: 'user-003',
    name: 'Saanvi Patel',
    email: 'saanvi.patel@example.com',
    joinDate: '2025-03-10',
    enrolledCourses: ['course-999'],
  },
  {
    id: 'user-004',
    name: 'Vihaan Singh',
    email: 'vihaan.singh@example.com',
    joinDate: '2025-04-05',
    enrolledCourses: ['course-101', 'course-202', 'course-303'],
  },
];