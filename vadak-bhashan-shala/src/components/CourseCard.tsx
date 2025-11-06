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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Utility to format price in INR
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
};

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
  const { t } = useLanguage();
  const { addToCart, items: cartItems } = useCart();
  // --- ⬇️ MODIFIED: Get the 'isEnrolled' function ⬇️ ---
  const { isEnrolled: isUserEnrolled } = useAuth();
  // --- ⬆️ END OF MODIFICATION ⬆️ ---
  const { toast } = useToast();

  // --- ⬇️ KEY CHANGE HERE ⬇️ ---
  // Destructure slug from the course object
  const { _id, title, instructor, price, thumbnailUrl, duration, rating, enrollments, category, slug } = course;
  const finalPrice = getFinalPrice(course);

  const isInCart = (cartItems ?? []).some(item => item._id === _id);
  // --- ⬇️ MODIFIED: Use the function from AuthContext ⬇️ ---
  const isEnrolled = isUserEnrolled(_id);
  // --- ⬆️ END OF MODIFICATION ⬆️ ---

  const handleAddToCart = () => {
    // Pass the full course object, which now matches the CartItem structure
    addToCart({
      ...course,
      id: course._id,
      image: course.thumbnailUrl,
      language: course.category === 'marathi' ? 'mr' : 'en'
    });
    toast({
      title: t('success'),
      description: t('courseAddedToCart', { courseTitle: title }),
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col h-full overflow-hidden">
      <div className="relative h-40 overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null; 
            e.currentTarget.src = `https://placehold.co/600x400/1e293b/f8fafc?text=${encodeURIComponent(title)}`;
          }}
        />
        <Badge className="absolute top-2 left-2 text-xs bg-indigo-500 hover:bg-indigo-600">
          {category}
        </Badge>
        {course.specialOffer?.isActive && (
          <Badge className="absolute top-2 right-2 text-xs bg-red-600 hover:bg-red-700 animate-pulse">
            {t('sale')}!
          </Badge>
        )}
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        {/* --- ⬇️ KEY CHANGE HERE ⬇️ ---
            Link now uses the course 'slug' instead of '_id' 
        */}
        <Link to={`/course/${slug}`} className="hover:text-primary transition-colors">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-3">{t('by')} {instructor}</p>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" />
            <span className="font-medium">{rating?.toFixed(1) || 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{duration} {t('hours')}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{enrollments}</span>
          </div>
        </div>
        
        <div className="mt-auto pt-2 border-t">
            {course.specialOffer?.isActive ? (
                <div>
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
              // --- MODIFIED SECTION ---
              <>
                <Link to={`/learn/${slug}`} className="flex-1"> 
                  <Button size="sm" className="w-full bg-green-500 hover:bg-green-600 text-white">
                    <CheckCircle className="w-4 h-4 mr-2" />{t('goToCourse')}
                  </Button>
                </Link>
                <Link to={`/course/${slug}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />{t('viewDetails', 'View Details')}
                  </Button>
                </Link>
              </>
              // --- END MODIFIED SECTION ---
            ) : isInCart ? (
              // --- MODIFIED SECTION ---
              <>
                <Link to="/cart" className="flex-1"> 
                  <Button size="sm" variant="outline" className="w-full">
                    <ShoppingCart className="w-4 h-4 mr-2" />{t('goToCart')}
                  </Button>
                </Link>
                <Link to={`/course/${slug}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />{t('viewDetails', 'View Details')}
                  </Button>
                </Link>
              </>
              // --- END MODIFIED SECTION ---
            ) : (
              // --- MODIFIED SECTION ---
              <>
                <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAddToCart}>
                  <ShoppingCart className="w-4 h-4 mr-2" />{t('addToCart')}
                </Button>
                <Link to={`/course/${slug}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />{t('viewDetails', 'View Details')}
                  </Button>
                </Link>
              </>
              // --- END MODIFIED SECTION ---
            )}

          </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;