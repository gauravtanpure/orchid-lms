import React, { useState, useMemo } from 'react';
import { Filter, Search, ChevronDown, BookOpen, Flag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import CourseCard, { CourseCategory } from './CourseCard';
import { Button } from '@/components/ui/button';

// Import course images
import marathiCourseImg from '@/assets/marathi-course.jpg';
import englishCourseImg from '@/assets/english-course.jpg';
const marathiCourseImgFallback = "https://via.placeholder.com/400x225?text=Marathi+Course";
const englishCourseImgFallback = "https://via.placeholder.com/400x225?text=English+Course";

interface Category {
  id: CourseCategory;
  icon: React.FC<any>; 
  translationKey: 'political' | 'public_speaking';
}

const CATEGORIES: Category[] = [
  { id: 'public_speaking', icon: BookOpen, translationKey: 'public_speaking' },
  { id: 'political', icon: Flag, translationKey: 'political' },
];

// Mock course data with bilingual support
const mockCourses: any[] = [
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
    thumbnail: marathiCourseImg || marathiCourseImgFallback,
    category: 'public_speaking' as const, 
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
    thumbnail: englishCourseImg || englishCourseImgFallback,
    category: 'public_speaking' as const,
    level: 'intermediate' as const,
    description: 'Master the art of confident English public speaking with proven techniques',
  },
  {
    id: '3',
    title: 'राजकीय संवाद आणि रणनीती',
    instructor: 'मान. विजय देशमुख',
    price: 4500, 
    originalPrice: 7000, 
    rating: 4.6, 
    reviewCount: 120, 
    duration: '18', 
    studentCount: 850,
    thumbnail: marathiCourseImg || marathiCourseImgFallback,
    category: 'political' as const, 
    level: 'advanced' as const,
    description: 'महाराष्ट्राच्या राजकारणासाठी प्रभावी संवाद साधण्याची कला आणि राजकीय रणनीती.',
  },
  {
    id: '4',
    title: 'Political Speech Writing & Delivery',
    instructor: 'Mr. Alex Turner',
    price: 5200, 
    rating: 4.7, 
    reviewCount: 200, 
    duration: '20', 
    studentCount: 1100,
    thumbnail: englishCourseImg || englishCourseImgFallback,
    category: 'political' as const, 
    level: 'advanced' as const,
    description: 'Techniques for crafting persuasive political speeches and delivering them with impact.',
  },
];

const CourseGrid: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'rating'>('popular');
  const [showFilters, setShowFilters] = useState(false);

  const handleCategorySelect = (categoryId: CourseCategory) => {
    setSelectedCategory(prev => (prev === categoryId ? null : categoryId));
  };
  
  const filteredCourses = useMemo(() => {
    let filtered = mockCourses;

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(lowerCaseSearch) ||
        course.instructor.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }
    
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    return filtered;
  }, [searchTerm, selectedLevel, selectedCategory]);

  const sortedCourses = useMemo(() => {
    let sorted = [...filteredCourses];

    switch (sortBy) {
      case 'price':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        sorted.sort((a, b) => b.studentCount - a.studentCount);
        break;
    }

    return sorted;
  }, [filteredCourses, sortBy]);

  return (
    <section id="courses" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Browse by Category Section */}
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
          {t('browse_by_category')}
        </h2>
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          {CATEGORIES.map((category) => (
            <div 
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`
                flex flex-col items-center justify-center p-4 w-40 h-32 rounded-xl cursor-pointer 
                shadow-lg transition-all duration-300 border-2 
                ${selectedCategory === category.id 
                  ? 'bg-primary text-white border-primary transform scale-105 shadow-primary/30' 
                  : 'bg-white text-gray-700 border-gray-100 hover:border-primary/50 hover:shadow-md'
                }
              `}
            >
              <category.icon 
                className={`w-10 h-10 mb-2 
                  ${selectedCategory === category.id ? 'text-white' : 'text-primary'}
                `} 
              />
              <span className={`text-base font-semibold text-center ${selectedCategory === category.id ? 'text-white' : ''}`}>
                {t(category.translationKey)}
              </span>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-heading mb-4">
            {t('courses')}
          </h2>
          <p className="text-subheading max-w-2xl mx-auto">
            {t('course_grid_subtitle')}
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
            
            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">{t('filter')} - {t('level_beginner')}/{t('level_intermediate')}/{t('level_advanced')}</option>
              <option value="beginner">{t('level_beginner')}</option>
              <option value="intermediate">{t('level_intermediate')}</option>
              <option value="advanced">{t('level_advanced')}</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="popular">{t('sortBy')}: {t('students')}</option>
              <option value="price">{t('sortBy')}: {t('price')}</option>
              <option value="rating">{t('sortBy')}: {t('rating')}</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center md:justify-start text-muted-foreground md:col-span-2">
              {sortedCourses.length} {t('courses').toLowerCase()} {sortedCourses.length === 1 ? '' : ''}
              
              {/* Active Category Tag */}
              {selectedCategory && (
                <span className="ml-4 text-sm px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                  {t(selectedCategory)}
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="ml-2 text-indigo-500 hover:text-indigo-800 font-bold"
                  >
                    &times;
                  </button>
                </span>
              )}
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
              {t('continueShopping')}
            </Button>
          </div>
        )}

        {/* No Results */}
        {sortedCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">{t('emptyCart')}</h3>
            <p className="text-muted-foreground">{t('emptyCartDescription')}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseGrid;