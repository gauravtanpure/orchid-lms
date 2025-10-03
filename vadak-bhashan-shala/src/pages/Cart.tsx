// /frontend/src/pages/Cart.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MockPaymentModal } from '@/components/MockPaymentModal';

const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:5000';

interface Coupon {
  _id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  description: string;
  minAmount: number;
}

const fetchCoupons = async (): Promise<Coupon[]> => {
  const { data } = await axios.get(`${API_URL}/api/coupons`);
  return data;
};

const Cart: React.FC = () => {
  const { items, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { enrollCourse, isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: availableCoupons = [] } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: fetchCoupons,
  });

  const calculateSubtotal = () => getTotalPrice();
  
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    let discount = (appliedCoupon.type === "percentage")
      ? (subtotal * appliedCoupon.discount) / 100
      : appliedCoupon.discount;
    return Math.min(discount, subtotal);
  };

  const calculateTotal = () => Math.max(calculateSubtotal() - calculateDiscount(), 0);
  
  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast({ 
        title: 'Login Required', 
        description: 'Please log in to proceed to checkout.', 
        variant: "destructive" 
      });
      navigate('/login');
      return;
    }
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    
    try {
      const courseIds = items.map(item => item.id);
      
      // Enroll in courses
      await enrollCourse(courseIds);
      
      // Clear cart after successful enrollment
      clearCart();
      setAppliedCoupon(null);
      setPaymentModalOpen(false);
      
      toast({ 
        title: 'Purchase Successful!', 
        description: 'You have been enrolled in your new courses.',
        variant: 'default'
      });
      
      // Navigate to my courses after a short delay
      setTimeout(() => {
        navigate('/my-courses');
      }, 500);
      
    } catch (error) {
      console.error('Enrollment error:', error);
      toast({ 
        title: 'Enrollment Failed', 
        description: (error as Error).message || 'Something went wrong. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center py-16 border border-border rounded-lg bg-card shadow-sm">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('emptyCart')}</h2>
            <p className="text-muted-foreground mb-6">{t('emptyCartDescription')}</p>
            <Button onClick={() => navigate('/courses')}>
              <Home className="w-4 h-4 mr-2" />{t('browseCourses')}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold mb-8 flex items-center">
          <ShoppingCart className="h-7 w-7 mr-3 text-primary" /> {t('shoppingCart')}
        </h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex gap-4 items-center">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-32 h-20 object-cover rounded" 
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('by')} {item.instructor}
                    </p>
                    <p className="font-bold text-primary">{formatPrice(item.price)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFromCart(item.id)} 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(calculateSubtotal())}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-success">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>- {formatPrice(calculateDiscount())}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <MockPaymentModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => !isProcessing && setPaymentModalOpen(false)} 
          onConfirm={handleConfirmPayment} 
          totalAmount={calculateTotal()}
          isProcessing={isProcessing}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Cart;