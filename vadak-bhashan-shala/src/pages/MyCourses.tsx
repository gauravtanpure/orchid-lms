// /frontend/src/pages/MyCourses.tsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, ChevronRight, GraduationCap, Loader2 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  const { data: enrolledCourses = [], isLoading: areCoursesLoading } = useQuery<Course[]>({
    queryKey: ['myCourses', user?._id],
    queryFn: () => fetchEnrolledCourses(token),
    enabled: !isAuthLoading && !!user && !!token,
  });

  if (isAuthLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold mb-8 flex items-center">
          <BookOpen className="h-7 w-7 mr-3 text-primary" />{t('myCourses')}
        </h1>
        {areCoursesLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-lg bg-card shadow-sm"><GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" /><h2 className="text-xl font-semibold mb-2">{t('noCoursesEnrolled')}</h2><p className="text-muted-foreground mb-6">{t('startLearningJourney')}</p><Link to="/courses"><Button>{t('courses')}</Button></Link></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course._id} className="group hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg"><img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 mb-2 h-14">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t('by')} {course.instructor}</p>
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
      </main>
      <Footer />
    </div>
  );
};

export default MyCourses;

