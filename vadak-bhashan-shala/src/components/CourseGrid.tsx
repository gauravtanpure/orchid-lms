// /frontend/src/components/CourseGrid.tsx
import React, { useState, useMemo } from 'react';
import { Filter, Search, Loader2, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';
import CourseCard from './CourseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types';

const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

// API function to fetch courses
const fetchCourses = async (): Promise<Course[]> => {
  const { data } = await axios.get(`${API_URL}/api/courses`);
  return data;
};

const CourseGrid: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const coursesPerPage = 9;

  // --- Data Fetching with React Query ---
  const { data: courses = [], isLoading, isError } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  // Extract unique categories from courses
  const categories = useMemo(() => {
    const cats = new Set(courses.map(course => course.category).filter(Boolean));
    return Array.from(cats);
  }, [courses]);

  // --- Filtering and Sorting Logic ---
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses;

    // Search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(lowerCaseSearch) ||
        course.instructor.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'popular':
        default:
          return (b.enrolledCount || 0) - (a.enrolledCount || 0);
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedLevel, sortBy, courses]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredAndSortedCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = filteredAndSortedCourses.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedLevel, sortBy]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSortBy('popular');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all' || sortBy !== 'popular';

  if (isError) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20 bg-card rounded-lg shadow-sm border border-border">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2 text-destructive">Failed to load courses</h3>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-heading mb-4">{t('courses')}</h2>
          <p className="text-subheading max-w-2xl mx-auto">{t('course_grid_subtitle')}</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="lg:w-[200px] h-11">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Toggle Button (Mobile) */}
            <Button
              variant="outline"
              className="lg:hidden h-11"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && <Badge variant="default" className="ml-2 rounded-full px-2">!</Badge>}
            </Button>
          </div>

          {/* Filter Section */}
          <div className={`flex flex-col sm:flex-row gap-4 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Level Filter */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="sm:w-[200px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="sm:w-auto">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {currentCourses.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredAndSortedCourses.length)} of {filteredAndSortedCourses.length} courses
            </span>
            {hasActiveFilters && (
              <span className="text-primary font-medium">
                {filteredAndSortedCourses.length} results found
              </span>
            )}
          </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : currentCourses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {currentCourses.map((course) => (
                <CourseCard key={course._id} {...course} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-10"
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
                          className="min-w-[40px] h-10"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-muted-foreground">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-10"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg shadow-sm border border-border">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">{t('noCoursesFound')}</h3>
            <p className="text-muted-foreground mb-6">{t('noCoursesFoundDescription')}</p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseGrid;