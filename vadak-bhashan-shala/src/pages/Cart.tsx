// /frontend/src/pages/Cart.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
// FIX: Standardizing useToast import path to follow ShadCN pattern
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Home, Loader2, XCircle, Tag } from 'lucide-react'; // Added Tag icon
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MockPaymentModal } from '@/components/MockPaymentModal';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge'; // Added Badge component


// --- ⬇️ FIX 1: Add local helper functions ⬇️ ---

// Utility to format price in INR
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
};

// Helper to get the final price for a single item
// (We need this to correctly display the item's price)
const getFinalPrice = (item: { price: number; specialOffer?: { isActive: boolean; discountType: string; discountValue: number; }; }): number => {
    let price = item.price;
    if (item.specialOffer?.isActive && item.specialOffer.discountValue > 0) {
        const { discountType, discountValue } = item.specialOffer;
        if (discountType === 'percentage') {
            price -= price * (discountValue / 100);
        } else {
            price -= discountValue;
        }
    }
    return Math.max(0, price);
};
// --- ⬆️ END OF FIX 1 ⬆️ ---


const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:1337';

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

// Mock Payment Modal Component (Assumed to be in its own file but included here for completeness)
// This is not part of the required fix, but is included to keep the original file's logic.
/*
const MockPaymentModal: React.FC<any> = ({ isOpen, onClose, onConfirm, totalAmount, isProcessing }) => {
    // ... MockPaymentModal implementation ...
    return null; // Placeholder
};
*/


const Cart: React.FC = () => {
  // --- ⬇️ FIX 2: Remove formatPrice from useLanguage() ⬇️ ---
  const { t } = useLanguage();
  // --- ⬆️ END OF FIX 2 ⬆️ ---
  const navigate = useNavigate();
  const { items, removeFromCart, clearCart, checkout, getTotalPrice } = useCart();
  // --- ⬇️ We need 'isAuthenticated' from useAuth() ⬇️ ---
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch available coupons
  const { data: coupons = [] } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: fetchCoupons,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user,
  });


  // Mutation for coupon application (simulated)
  const applyCouponMutation = useMutation({
    mutationFn: (code: string) => {
      const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase());
      if (!coupon) {
        throw new Error('Invalid or expired coupon code.');
      }
      if (getTotalPrice() < coupon.minAmount) {
        throw new Error(`Minimum purchase of ${formatPrice(coupon.minAmount)} required.`);
      }
      return Promise.resolve(coupon);
    },
    onSuccess: (coupon) => {
      setAppliedCoupon(coupon);
      toast({
        title: 'Coupon Applied',
        description: `${coupon.code} applied successfully! You saved ${coupon.discount}${coupon.type === 'percentage' ? '%' : ' in fixed amount'}.`,
        variant: 'default',
      });
    },
    onError: (error: any) => {
      setAppliedCoupon(null);
      toast({
        title: 'Coupon Error',
        description: error.message || 'Could not apply coupon.',
        variant: 'destructive',
      });
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter a coupon code.',
        variant: 'destructive',
      });
      return;
    }
    applyCouponMutation.mutate(couponCodeInput.trim());
  };

  const calculateTotal = () => {
    let subtotal = getTotalPrice();
    let total = subtotal;

    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        total = subtotal - (subtotal * appliedCoupon.discount) / 100;
      } else {
        total = subtotal - appliedCoupon.discount;
      }
    }
    // Ensure total doesn't go below zero
    return Math.max(0, total);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: 'Cart Empty',
        description: 'Please add items to your cart before checking out.',
        variant: 'destructive',
      });
      return;
    }

    // --- ⬇️ FIX 3: Add authentication check HERE ⬇️ ---
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to proceed to checkout.',
        variant: 'destructive',
      });
      navigate('/login'); // Redirect to login page
      return; // Stop the function
    }
    // --- ⬆️ END OF FIX ⬆️ ---

    // This line will now only run if the user is authenticated
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      // Simulate payment processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Execute the actual checkout/enrollment logic
      await checkout(); 
      
      toast({
        title: 'Enrollment Successful!',
        description: 'You have been successfully enrolled in the courses. Happy learning!',
        variant: 'default',
      });
      setPaymentModalOpen(false);
      navigate('/my-courses'); 

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: error.message || 'An error occurred during enrollment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" />
          {t('shoppingCart')}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 ? (
              <Card className="p-8 text-center bg-card">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold mb-2">{t('cartEmpty')}</h3>
                <p className="text-muted-foreground mb-6">{t('cartEmptyDescription')}</p>
                <Button onClick={() => navigate('/')}>
                  <Home className="w-4 h-4 mr-2" />
                  {t('continueShopping')}
                </Button>
              </Card>
            ) : (
              items.map(item => (
                <Card key={item._id} className="p-4 flex items-center justify-between bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; 
                          target.src = "https://placehold.co/80x56/1e293b/cbd5e1?text=Course";
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-base">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">By {item.instructor}</p>
                      {item.specialOffer?.isActive && item.specialOffer.discountValue > 0 && (
                          <Badge variant="secondary" className="mt-1 text-green-600 bg-green-50">
                              {item.specialOffer.description}
                          </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* --- ⬇️ FIX 3: Use getFinalPrice(item) instead of getTotalPrice() ⬇️ --- */}
                    <span className="font-bold text-lg text-primary">{formatPrice(getFinalPrice(item))}</span>
                    {/* --- ⬆️ END OF FIX 3 ⬆️ --- */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFromCart(item._id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 bg-card shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 border-b pb-2">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({items.length} items)</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>{t('couponDiscount')} ({appliedCoupon.code})</span>
                      <span>- {formatPrice(getTotalPrice() - calculateTotal())}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter Coupon Code"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="flex-grow"
                      disabled={applyCouponMutation.isPending}
                    />
                    <Button 
                      onClick={handleApplyCoupon} 
                      disabled={applyCouponMutation.isPending || !couponCodeInput.trim()}
                    >
                      {applyCouponMutation.isPending ? (
                         <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Tag className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Applied Coupon Info */}
                  {appliedCoupon && (
                    <div className="text-sm text-green-600 border border-green-200 bg-green-50 p-2 rounded-lg flex justify-between items-center">
                      <span className="font-medium">{appliedCoupon.code} Applied</span>
                      <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { setAppliedCoupon(null); setCouponCodeInput(''); }}>
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
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
                  disabled={isProcessing || items.length === 0}
                >
                  {isProcessing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
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