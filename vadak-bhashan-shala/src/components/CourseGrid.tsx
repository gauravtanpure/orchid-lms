// /frontend/src/components/CourseGrid.tsx
import React, { useState, useMemo } from 'react';
import { Filter, Search, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';
import CourseCard from './CourseCard';
import { Button } from '@/components/ui/button';
import { Course } from '@/types';

// API function to fetch courses
const fetchCourses = async (): Promise<Course[]> => {
  const { data } = await axios.get('http://localhost:5000/api/courses');
  return data;
};

const CourseGrid: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // --- Data Fetching with React Query ---
  const { data: courses = [], isLoading, isError } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  // --- Filtering Logic (operates on fetched data) ---
  const filteredCourses = useMemo(() => {
    let filtered = courses;

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(lowerCaseSearch) ||
        course.instructor.toLowerCase().includes(lowerCaseSearch)
      );
    }
    // Add other filters (category, level) here if needed
    return filtered;
  }, [searchTerm, courses]);
  
  if (isError) {
    return <div className="text-center py-20 text-red-500">Failed to load courses. Please try again later.</div>
  }

  return (
    <section id="courses" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-heading mb-4">{t('courses')}</h2>
          <p className="text-subheading max-w-2xl mx-auto">{t('course_grid_subtitle')}</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} {...course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">{t('noCoursesFound')}</h3>
            <p className="text-muted-foreground">{t('noCoursesFoundDescription')}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseGrid;