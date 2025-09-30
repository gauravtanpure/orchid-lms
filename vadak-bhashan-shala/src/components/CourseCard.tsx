import React from 'react';
import { Star, Clock, Users, ShoppingCart, Eye, CheckCircle } from 'lucide-react'; // Added CheckCircle
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom'; // Import Link

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  duration: string;
  studentCount: number;
  thumbnail: string;
  category: 'marathi' | 'english';
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  instructor,
  price,
  originalPrice,
  rating,
  reviewCount,
  duration,
  studentCount,
  thumbnail,
  category,
  level,
  description,
}) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isLoggedIn, isEnrolled } = useAuth(); // Use auth hooks
  
  const enrolled = isLoggedIn && isEnrolled(id); // Check enrollment status

  const handleAddToCart = () => {
    addToCart({
      id,
      title,
      price,
      image: thumbnail,
      instructor,
      language: category === 'marathi' ? 'mr' : 'en'
    });
    toast({
      title: t('courseAdded'),
      description: `${title} ${t('addedToCart')}`,
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-success text-success-foreground';
      case 'intermediate': return 'bg-secondary text-secondary-foreground';
      case 'advanced': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatPrice = (price: number) => {
    return language === 'mr' ? `₹${price}` : `₹${price}`;
  };

  return (
    <div className="card-course group">
      {/* Course Thumbnail */}
      <div className="relative overflow-hidden aspect-video">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(level)}`}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
            {category === 'marathi' ? 'मराठी' : 'English'}
          </span>
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button size="sm" variant="outline" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary">
            <Eye className="w-4 h-4 mr-2" />
            {t('viewDetails')}
          </Button>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">by {instructor}</p>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium ml-1">{rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
        </div>

        {/* Course Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration} {t('hours')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{studentCount.toLocaleString()} {t('students')}</span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">
              {formatPrice(price)}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {enrolled ? (
            <Link to={`/my-courses`}> {/* Link to /my-courses or course detail page */}
                <Button 
                size="sm" 
                className="w-full btn-success"
                >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('goToCourse')}
                </Button>
            </Link>
          ) : (
            <>
              <Button 
                size="sm" 
                className="flex-1 btn-primary"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t('addToCart')}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1"
              >
                {t('buyNow')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;