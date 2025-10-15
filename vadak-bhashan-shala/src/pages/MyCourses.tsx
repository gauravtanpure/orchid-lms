import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, ChevronRight, GraduationCap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Course {
  _id: string;
  title: string;
  description: string;
  slug?: string; // ✅ make optional for older enrollments
  category: string;
  completionRate: number;
}

const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const fetchEnrolledCourses = async (token: string | null): Promise<Course[]> => {
  if (!token) return [];

  const config = { 
    headers: { 
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-store',
      'Pragma': 'no-cache',
      'Expires': '0',
      'If-Modified-Since': '0'
    }
  };

  const url = `${API_URL}/api/users/my-courses`;
  const { data } = await axios.get(url, config);
  return data;
};

const MyCourses: React.FC = () => {
  const { user, isLoggedIn, token } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  const queryKey = ['enrolledCourses', user?.id];
  const { data: enrolledCourses = [], isLoading, isError, error, refetch } = useQuery<Course[]>({
    queryKey,
    queryFn: () => fetchEnrolledCourses(token),
    enabled: isLoggedIn && !!token,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const handleCourseUpdate = () => refetch();
    window.addEventListener('courses-updated', handleCourseUpdate);
    return () => window.removeEventListener('courses-updated', handleCourseUpdate);
  }, [refetch]);

  const totalCourses = enrolledCourses.length;
  const totalPages = Math.ceil(totalCourses / coursesPerPage);
  const currentCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    return enrolledCourses.slice(startIndex, startIndex + coursesPerPage);
  }, [enrolledCourses, currentPage]);

  if (!isLoggedIn) {
    return <p className="text-center p-8">Please log in to view your courses.</p>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-800 flex items-center">
          <GraduationCap className="w-8 h-8 mr-3 text-indigo-600" />
          My Enrolled Courses
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="ml-2 text-lg text-gray-600">Loading your course list...</span>
          </div>
        ) : isError ? (
          <Card className="border-red-500 bg-red-50">
            <CardContent className="p-4 text-red-700">
              <p className="font-semibold">Error Loading Courses</p>
              <p>{(error as Error).message}</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-2 text-red-700 border-red-500 hover:bg-red-100">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : totalCourses === 0 ? (
          <div className="text-center p-12 border border-dashed rounded-lg bg-white">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">You are not currently enrolled in any courses.</h2>
            <p className="text-gray-500 mt-2">Browse the catalog to find your next course!</p>
            <Link to="/courses">
              <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700">Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentCourses.map((course) => {
  // ✅ ensure slug is always available
  const slug = course.slug || '';

  return (
    <Card key={course._id} className="hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg text-indigo-700">{course.title}</CardTitle>
        <CardDescription className="text-sm">
          Progress: {course.completionRate.toFixed(0)}% Complete
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 line-clamp-2 mb-4">{course.description}</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-green-500 h-2.5 rounded-full"
            style={{ width: `${course.completionRate}%` }}
          />
        </div>
        {slug ? (
          <Link to={`/learn/${slug}`}>
            <Button variant="default" className="w-full bg-green-500 hover:bg-green-600">
              Continue Learning
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        ) : (
          // 🔁 Fallback for older enrollments missing slug
          <Button
            variant="outline"
            className="w-full bg-yellow-400/80 hover:bg-yellow-500 text-black"
            onClick={() => alert('This course was enrolled before slugs were added. Please re-enroll.')}
          >
            Missing Slug – Re-Enroll Needed
          </Button>
        )}
      </CardContent>
    </Card>
  );
})}

            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyCourses;
