import React, { useState } from 'react';
import { Filter, Search, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import CourseCard from './CourseCard';
import { Button } from '@/components/ui/button';

// Import course images
import marathiCourseImg from '@/assets/marathi-course.jpg';
import englishCourseImg from '@/assets/english-course.jpg';

// Mock course data - in real app, this would come from API
const mockCourses = [
  {
    id: '1',
    title: 'मराठी भाषण कौशल्य - प्राथमिक स्तर',
    instructor: 'प्रा. राज कुलकर्णी',
    price: 2999,
    originalPrice: 4999,
    rating: 4.8,
    reviewCount: 234,
    duration: '12',
    studentCount: 1500,
    thumbnail: marathiCourseImg,
    category: 'marathi' as const,
    level: 'beginner' as const,
    description: 'मराठी भाषेतील प्रभावी भाषण करण्याचे मूलभूत तंत्र शिका',
  },
  {
    id: '2',
    title: 'English Public Speaking Mastery',
    instructor: 'Dr. Sarah Johnson',
    price: 3499,
    originalPrice: 5999,
    rating: 4.9,
    reviewCount: 456,
    duration: '15',
    studentCount: 2200,
    thumbnail: englishCourseImg,
    category: 'english' as const,
    level: 'intermediate' as const,
    description: 'Master the art of confident English public speaking with proven techniques',
  },
  {
    id: '3',
    title: 'सार्वजनिक सादरीकरण तंत्र',
    instructor: 'डॉ. मीना पाटील',
    price: 2499,
    rating: 4.7,
    reviewCount: 189,
    duration: '10',
    studentCount: 980,
    thumbnail: marathiCourseImg,
    category: 'marathi' as const,
    level: 'intermediate' as const,
    description: 'प्रभावी सादरीकरणासाठी आवश्यक तंत्रे आणि युक्त्या',
  },
  {
    id: '4',
    title: 'Advanced Business Presentation',
    instructor: 'Mr. Robert Chen',
    price: 4999,
    originalPrice: 7999,
    rating: 4.9,
    reviewCount: 312,
    duration: '20',
    studentCount: 1800,
    thumbnail: englishCourseImg,
    category: 'english' as const,
    level: 'advanced' as const,
    description: 'Professional business presentation skills for corporate success',
  },
  {
    id: '5',
    title: 'व्यक्तिमत्व विकास आणि संवाद',
    instructor: 'प्रा. अनिल देशमुख',
    price: 1999,
    rating: 4.6,
    reviewCount: 156,
    duration: '8',
    studentCount: 750,
    thumbnail: marathiCourseImg,
    category: 'marathi' as const,
    level: 'beginner' as const,
    description: 'व्यक्तिमत्व विकास आणि प्रभावी संवाद कौशल्ये',
  },
  {
    id: '6',
    title: 'Confident Communication Skills',
    instructor: 'Ms. Lisa Taylor',
    price: 3299,
    rating: 4.8,
    reviewCount: 278,
    duration: '14',
    studentCount: 1650,
    thumbnail: englishCourseImg,
    category: 'english' as const,
    level: 'intermediate' as const,
    description: 'Build confidence and master effective communication in English',
  },
];

const CourseGrid: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'marathi' | 'english'>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'rating'>('popular');
  const [showFilters, setShowFilters] = useState(false);

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
      default:
        return b.studentCount - a.studentCount;
    }
  });

  return (
    <section id="courses" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-heading mb-4">
            {t('courses')}
          </h2>
          <p className="text-subheading max-w-2xl mx-auto">
            Choose from our comprehensive selection of public speaking courses in both Marathi and English
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1">
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

            {/* Filter Toggle - Mobile */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('filter')}
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filter Options */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="marathi">{t('marathiCourses')}</option>
              <option value="english">{t('englishCourses')}</option>
            </select>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="popular">Most Popular</option>
              <option value="price">Price: Low to High</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center md:justify-start text-muted-foreground">
              {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>

        {/* Load More Button */}
        {sortedCourses.length > 0 && (
          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              Load More Courses
            </Button>
          </div>
        )}

        {/* No Results */}
        {sortedCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseGrid;