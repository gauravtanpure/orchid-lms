// /frontend/src/components/CourseCard.tsx

import React from 'react';
import { Star, Clock, Users, ShoppingCart, Eye, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Course } from '@/types'; 

interface CourseCardProps extends Course {
  originalPrice?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

const CourseCard: React.FC<CourseCardProps> = ({
  _id,
  title,
  instructor,
  price,
  originalPrice,
  thumbnailUrl,
  category,
  rating = 4.8, 
  reviewCount = 150,
  studentCount = 1200,
  level = 'beginner',
}) => {
  const { t } = useLanguage();
  const { addToCart, items } = useCart();
  const { toast } = useToast();
  const { isLoggedIn, user } = useAuth();
  
  // 🟢 CRITICAL FIX: Correctly check enrollment by checking the 'courseId' field in the enrolledCourses objects
  const isEnrolled = 
    isLoggedIn && 
    user?.enrolledCourses?.some(enrollment => enrollment.courseId === _id);

  const isInCart = items.some(item => item.id === _id);

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast({
        title: t('loginRequired'),
        description: t('loginRequiredDescription'),
        variant: "destructive",
      });
      return;
    }

    addToCart({ 
      id: _id, 
      title, 
      price, 
      image: thumbnailUrl, 
      instructor,
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

  const formatPrice = (priceNum: number) => `₹${priceNum.toLocaleString('en-IN')}`;

  return (
    <div className="card-course group">
      <div className="relative overflow-hidden aspect-video">
        <img 
          src={thumbnailUrl} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(level)}`}>
            {t(`level_${level}`)}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-2 h-14">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{t('by')} {instructor}</p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium ml-1">{rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">({reviewCount} {t('reviews')})</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">{formatPrice(price)}</span>
              {originalPrice && <span className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice)}</span>}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {isEnrolled ? (
              <Link to={`/learn/${_id}`} className="w-full"> 
                <Button size="sm" className="w-full btn-success">
                  <CheckCircle className="w-4 h-4 mr-2" />{t('goToCourse')}
                </Button>
              </Link>
            ) : isInCart ? (
               <Link to="/cart" className="w-full"> 
                <Button size="sm" variant="outline" className="w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />{t('goToCart')}
                </Button>
              </Link>
            ) : (
              <Button size="sm" className="w-full btn-primary" onClick={handleAddToCart}>
                <ShoppingCart className="w-4 h-4 mr-2" />{t('addToCart')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;