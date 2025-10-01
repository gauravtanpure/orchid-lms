import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, CreditCard, Tag, X, AlertCircle, CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Available coupons - In production, this should come from your backend/context
const availableCoupons = [
  { 
    code: "WELCOME20", 
    discount: 20, 
    type: "percentage", 
    description: "20% off for new users", 
    minAmount: 0 
  },
  { 
    code: "SAVE500", 
    discount: 500, 
    type: "fixed", 
    description: "Flat ₹500 off", 
    minAmount: 3000 
  },
  { 
    code: "MEGA30", 
    discount: 30, 
    type: "percentage", 
    description: "30% off on orders above ₹5000", 
    minAmount: 5000 
  },
  { 
    code: "FIRST100", 
    discount: 100, 
    type: "fixed", 
    description: "₹100 off on first purchase", 
    minAmount: 0 
  },
  { 
    code: "STUDENT15", 
    discount: 15, 
    type: "percentage", 
    description: "15% student discount", 
    minAmount: 1000 
  }
];

const Cart: React.FC = () => {
  const { items, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { enrollCourse, isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<typeof availableCoupons[0] | null>(null);
  const [couponError, setCouponError] = useState("");
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);

  const calculateSubtotal = () => {
    return getTotalPrice();
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;

    const subtotal = calculateSubtotal();
    let discount = 0;

    if (appliedCoupon.type === "percentage") {
      discount = (subtotal * appliedCoupon.discount) / 100;
    } else {
      discount = appliedCoupon.discount;
    }

    // Cap discount at subtotal
    return Math.min(discount, subtotal);
  };

  const calculateTotal = () => {
    return Math.max(calculateSubtotal() - calculateDiscount(), 0);
  };

  const applyCoupon = (code: string) => {
    const coupon = availableCoupons.find(c => c.code === code.toUpperCase());
    
    if (!coupon) {
      setCouponError(t('invalidCoupon') || "Invalid coupon code");
      return;
    }

    if (appliedCoupon && appliedCoupon.code === coupon.code) {
      setCouponError(t('couponAlreadyApplied') || "Coupon already applied");
      return;
    }

    const subtotal = calculateSubtotal();
    if (subtotal < coupon.minAmount) {
      setCouponError(`${t('minimumAmount') || 'Minimum order amount of'} ₹${coupon.minAmount.toLocaleString()} ${t('required') || 'required'}`);
      return;
    }

    // If there's already a coupon applied, replace it
    if (appliedCoupon) {
      toast({
        title: t('couponReplaced') || "Coupon Replaced!",
        description: `${appliedCoupon.code} replaced with ${coupon.code}`,
      });
    } else {
      toast({
        title: t('couponApplied') || "Coupon Applied!",
        description: `${coupon.code} - ${coupon.description}`,
      });
    }

    setAppliedCoupon(coupon);
    setCouponCode("");
    setCouponError("");
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({
      title: t('couponRemoved') || "Coupon Removed",
      variant: "destructive",
    });
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast({
        title: t('loginRequired'),
        description: t('loginRequiredDescription'),
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    // Process purchase - enroll user in all cart courses
    items.forEach(item => {
      enrollCourse(item.id);
    });

    // Clear cart and coupon after successful purchase
    clearCart();
    setAppliedCoupon(null);

    // Show success message
    const savedAmount = calculateDiscount();
    toast({
      title: t('purchaseSuccess') || 'Purchase Successful!',
      description: savedAmount > 0 
        ? `${t('coursesEnrolled') || 'You have been enrolled in your courses.'} ${t('youSaved') || 'You saved'} ₹${savedAmount.toLocaleString()}!`
        : t('coursesEnrolled') || 'You have been enrolled in your courses.',
    });

    // Redirect to My Courses
    navigate('/my-courses');
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center py-16 border border-border rounded-lg bg-card shadow-sm">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('emptyCart')}</h2>
            <p className="text-muted-foreground mb-6">{t('emptyCartDescription')}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('goBack') || 'Go Back'}
              </Button>
              <Button onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                {t('browseCourses') || 'Browse Courses'}
              </Button>
            </div>
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
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('goBack') || 'Go Back'}
          </Button>
          <span className="text-muted-foreground">/</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/courses')}
            className="gap-2"
          >
            {t('courses') || 'Courses'}
          </Button>
        </div>

        <h1 className="text-3xl font-heading font-bold mb-8 flex items-center">
          <ShoppingCart className="h-7 w-7 mr-3 text-primary" />
          {t('shoppingCart') || 'Shopping Cart'}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
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
                      <p className="font-bold text-primary">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Available Coupons Section */}
            <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-4">
                <button
                  onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    <span className="font-semibold">{t('availableOffers') || 'Available Offers'}</span>
                  </div>
                  <span className="text-sm text-primary font-medium">
                    {showAvailableCoupons ? (t('hide') || 'Hide') : (t('viewAll') || 'View All')}
                  </span>
                </button>

                {showAvailableCoupons && (
                  <div className="mt-4 space-y-3">
                    {availableCoupons.map((coupon) => {
                      const isApplied = appliedCoupon?.code === coupon.code;
                      const subtotal = calculateSubtotal();
                      const isEligible = subtotal >= coupon.minAmount;

                      return (
                        <Card 
                          key={coupon.code}
                          className={`${isApplied ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <code className="font-mono font-bold text-sm bg-muted px-2 py-1 rounded">
                                    {coupon.code}
                                  </code>
                                  {isApplied && (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{coupon.description}</p>
                                {!isEligible && coupon.minAmount > 0 && (
                                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {t('addMore') || 'Add'} ₹{(coupon.minAmount - subtotal).toLocaleString()} {t('moreToUse') || 'more to use this'}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => isApplied ? removeCoupon() : applyCoupon(coupon.code)}
                                disabled={!isEligible && !isApplied}
                                variant={isApplied ? "secondary" : "default"}
                                className={isApplied ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}
                              >
                                {isApplied ? (t('applied') || 'Applied') : (t('apply') || 'Apply')}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {t('orderSummary') || 'Order Summary'}
                </h3>

                {/* Coupon Input */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">
                    {t('haveCoupon') || 'Have a coupon code?'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          applyCoupon(couponCode);
                        }
                      }}
                      placeholder={t('enterCode') || 'Enter code'}
                      className="flex-1 px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      size="sm"
                      onClick={() => applyCoupon(couponCode)}
                      disabled={!couponCode}
                    >
                      {t('apply') || 'Apply'}
                    </Button>
                  </div>
                  {couponError && (
                    <div className="mt-2 flex items-center gap-1 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{couponError}</span>
                    </div>
                  )}
                </div>

                {/* Applied Coupon */}
                {appliedCoupon && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">{t('appliedCoupon') || 'Applied Coupon'}:</p>
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-600" />
                        <div>
                          <span className="font-mono text-sm font-semibold text-green-700 dark:text-green-400 block">{appliedCoupon.code}</span>
                          <span className="text-xs text-green-600 dark:text-green-500">{appliedCoupon.description}</span>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-destructive hover:bg-destructive/10 p-1 rounded transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('subtotal') || 'Subtotal'}</span>
                    <span>{formatPrice(calculateSubtotal())}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>{t('discount') || 'Discount'}</span>
                      <span>-{formatPrice(calculateDiscount())}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('tax') || 'Tax'}</span>
                    <span>₹0</span>
                  </div>
                  
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>{t('total') || 'Total'}</span>
                    <span className="text-primary">{formatPrice(calculateTotal())}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <p className="text-sm text-green-700 dark:text-green-400 text-center font-medium">
                        🎉 {t('youSaved') || 'You saved'} {formatPrice(calculateDiscount())}!
                      </p>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full mb-3"
                  onClick={handleCheckout}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('checkout') || 'Proceed to Checkout'}
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/courses')}
                >
                  {t('continueShopping')}
                </Button>
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