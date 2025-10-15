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

const getFinalPrice = (course: Course): number => {
    if (!course.specialOffer?.isActive || course.specialOffer.discountValue <= 0) {
        return course.price;
    }
    const { price, specialOffer } = course;
    const { discountType, discountValue } = specialOffer;
    let finalPrice: number;
    if (discountType === 'percentage') {
        const discount = (price * discountValue) / 100;
        finalPrice = price - discount;
    } else { 
        finalPrice = price - discountValue;
    }
    return Math.max(0, finalPrice);
};


const CourseCard: React.FC<Course> = (course) => {
  // --- 👇 THIS IS THE ONLY LINE I've ADDED ---
  console.log("CourseCard receiving data:", course);

  const { _id, title, instructor, price, thumbnailUrl } = course;
  const { t } = useLanguage();
  const { addToCart, items } = useCart();
  const { toast } = useToast();
  const { isLoggedIn, user } = useAuth();
  
  const isEnrolled = 
    isLoggedIn && 
    user?.enrolledCourses?.some(enrollment => enrollment.courseId === _id);

  const isInCart = items.some(item => item.id === _id);
  
  const finalPrice = getFinalPrice(course);
  const hasOffer = course.specialOffer?.isActive && finalPrice < course.price;

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
    _id,                // ✅ must use _id, not id
    id: _id,            // optional duplicate for safety
    title,
    price: finalPrice,
    image: thumbnailUrl,
    instructor,
    language: course.language,
    slug: course.slug,  // ✅ add slug so we can later link to it
  });

    toast({
      title: t('courseAdded'),
      description: `${title} ${t('addedToCart')}`,
    });
  };

  const getLevelColor = (level: string = 'beginner') => {
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
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor()}`}>
            {t(`level_beginner`)}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-2 h-14">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{t('by')} {instructor}</p>

        <div className="flex items-center gap-2 mb-4">
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between">
            {hasOffer ? (
                <div className="flex flex-col">
                  <span className="text-xs text-green-600 font-semibold">{course.specialOffer.description}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">{formatPrice(finalPrice)}</span>
                    <span className="text-sm text-muted-foreground line-through">{formatPrice(price)}</span>
                  </div>
                </div>
              ) : (
                <span className="text-xl font-bold text-primary">{formatPrice(price)}</span>
              )}
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