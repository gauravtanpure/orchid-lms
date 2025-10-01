import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, BookOpen, ChevronRight, GraduationCap, Loader2 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Mock Course Data
const mockCourses = [
  {
    id: 'course-101',
    title: {
      en: 'Advanced Public Speaking for Professionals',
      mr: 'व्यावसायिकांसाठी प्रगत सार्वजनिक भाषण'
    },
    instructor: {
      en: 'Dr. Anjali Deshmukh',
      mr: 'डॉ. अंजली देशमुख'
    },
    duration: '20',
    category: 'marathi',
    thumbnail: 'https://images.unsplash.com/photo-1549490349-f06534b12285?fit=crop&w=800&q=80',
    progress: '50%',
  },
  {
    id: 'course-999',
    title: {
      en: 'Free Intro to Communication Skills',
      mr: 'संवाद कौशल्यांचा मोफत परिचय'
    },
    instructor: {
      en: 'Ms. Priya Patil',
      mr: 'सौ. प्रिया पाटील'
    },
    duration: '5',
    category: 'english',
    thumbnail: 'https://images.unsplash.com/photo-1510511459019-5be77da9cfa2?fit=crop&w=800&q=80',
    progress: '0%',
  },
  {
    id: 'course-202',
    title: {
      en: 'English Fluency: From Basics to Business',
      mr: 'इंग्रजी प्रवाहीता: मूलभूत गोष्टींपासून व्यवसायापर्यंत'
    },
    instructor: {
      en: 'Mr. Rohan Kulkarni',
      mr: 'श्री. रोहन कुलकर्णी'
    },
    duration: '35',
    category: 'english',
    thumbnail: 'https://images.unsplash.com/photo-1546946022-793db5f8f8ed?fit=crop&w=800&q=80',
    progress: '100%',
  },
  {
    id: 'course-303',
    title: {
      en: 'The Art of Persuasion and Negotiation',
      mr: 'प्रेरणा आणि वाटाघाटीची कला'
    },
    instructor: {
      en: 'Ms. Priya Patil',
      mr: 'सौ. प्रिया पाटील'
    },
    duration: '15',
    category: 'english',
    thumbnail: 'https://images.unsplash.com/photo-1524178232363-2ce9bc237c7f?fit=crop&w=800&q=80',
    progress: '0%',
  },
];

const MyCourses: React.FC = () => {
  const { user, isLoggedIn, isLoading } = useAuth();
  const { t, language } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  const enrolledCourses = mockCourses.filter(course => 
    user?.enrolledCourses?.includes(course.id)
  );

  const getCourseProgressColor = (progress: string) => {
    if (progress === '100%') return 'bg-success';
    if (progress === '0%') return 'bg-muted';
    return 'bg-primary';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold mb-8 flex items-center">
          <BookOpen className="h-7 w-7 mr-3 text-primary" />
          {t('myCourses')}
        </h1>
        
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-lg bg-card shadow-sm">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('noCoursesEnrolled')}</h2>
            <p className="text-muted-foreground mb-6">{t('startLearningJourney')}</p>
            <Link to="/courses">
              <Button>{t('courses')}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="group hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <img 
                      src={course.thumbnail} 
                      alt={typeof course.title === 'object' ? course.title[language] : course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                      {course.category === 'marathi' ? t('marathiCourses') : t('englishCourses')}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 mb-2">
                      {typeof course.title === 'object' ? course.title[language] : course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('by')} {typeof course.instructor === 'object' ? course.instructor[language] : course.instructor}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>{t('progress')}</span>
                        <span className="text-card-foreground">{course.progress}</span>
                      </div>
                      <div className="w-full bg-muted-foreground/20 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${getCourseProgressColor(course.progress)}`} 
                          style={{ width: course.progress }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end">
                      <Link to={`/course/${course.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                          {course.progress === '100%' ? t('viewCertificate') : t('continueLearning')} 
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