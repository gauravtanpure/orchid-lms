import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Cart: React.FC = () => {
  const { items, removeFromCart, getTotalPrice, getTotalItems, clearCart } = useCart(); // Added clearCart
  const { t } = useLanguage();
  const { isLoggedIn, enrollCourse } = useAuth(); // Use auth and enroll
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to proceed to checkout.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      // 1. Enroll user in all courses
      items.forEach(item => {
        // Only enroll if course is not a duplicate in the context, which enrollCourse handles
        enrollCourse(item.id); 
      });
      
      // 2. Clear the cart
      clearCart();

      // 3. Show success toast
      toast({
        title: "Purchase Successful!",
        description: "Your courses have been added to your My Courses section. Redirecting...",
      });

      // 4. Navigate to My Courses page
      navigate('/my-courses');
      setIsProcessing(false);
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold mb-2">{t('emptyCart')}</h1>
            <p className="text-muted-foreground mb-6">{t('emptyCartDescription')}</p>
            <Link to="/">
              <Button>{t('continueShopping')}</Button>
            </Link>
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
        <h1 className="text-3xl font-heading font-bold mb-8">{t('shoppingCart')}</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-muted-foreground">{item.instructor}</p>
                      <p className="text-lg font-bold text-primary mt-1">
                        ₹{item.price}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t('orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>{t('totalItems')}:</span>
                  <span>{getTotalItems()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('total')}:</span>
                  <span>₹{getTotalPrice()}</span>
                </div>
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? t('processing_checkout') : t('proceedToCheckout')}
                </Button>
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    {t('continueShopping')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;