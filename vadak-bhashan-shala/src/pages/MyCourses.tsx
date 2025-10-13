// // /frontend/src/pages/MyCourses.tsx
// import React from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { useLanguage } from '@/contexts/LanguageContext';
// import { BookOpen, ChevronRight, GraduationCap, Loader2 } from 'lucide-react';
// import { Link, Navigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import Header from '@/components/Header';
// import Footer from '@/components/Footer';
// import { useQuery } from '@tanstack/react-query';
// import axios from 'axios';
// import { Course } from '@/types';

// const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

// const fetchEnrolledCourses = async (token: string | null): Promise<Course[]> => {
//   if (!token) return [];
//   const config = { headers: { Authorization: `Bearer ${token}` } };
//   const { data } = await axios.get(`${API_URL}/api/users/my-courses`, config);
//   return data;
// };

// const MyCourses: React.FC = () => {
//   const { user, isLoggedIn, isLoading: isAuthLoading, token } = useAuth();
//   const { t } = useLanguage();

//   const { data: enrolledCourses = [], isLoading: areCoursesLoading } = useQuery<Course[]>({
//     queryKey: ['myCourses', user?._id],
//     queryFn: () => fetchEnrolledCourses(token),
//     enabled: !isAuthLoading && !!user && !!token,
//   });

//   if (isAuthLoading) {
//     return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
//   }

//   if (!isLoggedIn) {
//     return <Navigate to="/login" replace />;
//   }
  
//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
//       <main className="container mx-auto px-4 py-8">
//         <h1 className="text-3xl font-heading font-bold mb-8 flex items-center">
//           <BookOpen className="h-7 w-7 mr-3 text-primary" />{t('myCourses')}
//         </h1>
//         {areCoursesLoading ? (
//           <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
//         ) : enrolledCourses.length === 0 ? (
//           <div className="text-center py-16 border border-border rounded-lg bg-card shadow-sm"><GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" /><h2 className="text-xl font-semibold mb-2">{t('noCoursesEnrolled')}</h2><p className="text-muted-foreground mb-6">{t('startLearningJourney')}</p><Link to="/courses"><Button>{t('courses')}</Button></Link></div>
//         ) : (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {enrolledCourses.map((course) => (
//               <Card key={course._id} className="group hover:shadow-xl transition-shadow duration-300">
//                 <CardContent className="p-0">
//                   <div className="relative aspect-video overflow-hidden rounded-t-lg"><img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
//                   <div className="p-4">
//                     <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 mb-2 h-14">{course.title}</h3>
//                     <p className="text-sm text-muted-foreground mb-3">{t('by')} {course.instructor}</p>
//                     <div className="flex items-center justify-end">
//                       <Link to={`/learn/${course._id}`}>
//                         <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
//                           {course.completionRate === 0 ? t('startLearning') : t('continueLearning')} 
//                           <ChevronRight className="w-4 h-4 ml-1" />
//                         </Button>
//                       </Link>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default MyCourses;

// /frontend/src/pages/MyCourses.tsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, ChevronRight, GraduationCap, Loader2, Search, Filter, ChevronLeft } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Course } from '@/types';

const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const fetchEnrolledCourses = async (token: string | null): Promise<Course[]> => {
  if (!token) return [];
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.get(`${API_URL}/api/users/my-courses`, config);
  return data;
};

const MyCourses: React.FC = () => {
  const { user, isLoggedIn, isLoading: isAuthLoading, token } = useAuth();
  const { t } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  const { data: enrolledCourses = [], isLoading: areCoursesLoading } = useQuery<Course[]>({
    queryKey: ['myCourses', user?._id],
    queryFn: () => fetchEnrolledCourses(token),
    enabled: !isAuthLoading && !!user && !!token,
  });

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = enrolledCourses.filter(course => 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'progress':
          return (b.completionRate || 0) - (a.completionRate || 0);
        case 'recent':
        default:
          return 0; // Keep original order (most recent enrollments first)
      }
    });

    return filtered;
  }, [enrolledCourses, searchQuery, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = filteredAndSortedCourses.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2 flex items-center">
            <BookOpen className="h-7 w-7 mr-3 text-primary" />
            {t('myCourses')}
          </h1>
          <p className="text-muted-foreground">
            {enrolledCourses.length} {enrolledCourses.length === 1 ? 'course' : 'courses'} enrolled
          </p>
        </div>

        {areCoursesLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-lg bg-card shadow-sm">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('noCoursesEnrolled')}</h2>
            <p className="text-muted-foreground mb-6">{t('startLearningJourney')}</p>
            <Link to="/courses">
              <Button>{t('courses')}</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Filters Section */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search courses by title or instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 sm:w-auto w-full">
                <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="sm:w-[180px] w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="title">Title (A-Z)</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Info */}
            {searchQuery && (
              <div className="mb-4 text-sm text-muted-foreground">
                Found {filteredAndSortedCourses.length} {filteredAndSortedCourses.length === 1 ? 'course' : 'courses'}
              </div>
            )}

            {/* Courses Grid */}
            {currentCourses.length === 0 ? (
              <div className="text-center py-16 border border-border rounded-lg bg-card">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentCourses.map((course) => (
                  <Card key={course._id} className="group hover:shadow-xl transition-all duration-300 border-border">
                    <CardContent className="p-0">
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        <img 
                          src={course.thumbnailUrl} 
                          alt={course.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        {course.completionRate !== undefined && course.completionRate > 0 && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                            {course.completionRate}%
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 mb-2 h-14 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {t('by')} {course.instructor}
                        </p>
                        
                        {/* Progress Bar */}
                        {course.completionRate !== undefined && course.completionRate > 0 && (
                          <div className="mb-3">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${course.completionRate}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-end">
                          <Link to={`/learn/${course._id}`}>
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                              {course.completionRate === 0 ? t('startLearning') : t('continueLearning')} 
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
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