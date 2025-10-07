// /frontend/src/pages/Cart.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Home, Loader2, XCircle, Tag } from 'lucide-react'; // Added Tag icon
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MockPaymentModal } from '@/components/MockPaymentModal';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge'; // Added Badge component


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

const validateCoupon = async ({ code, subtotal }: { code: string, subtotal: number }): Promise<Coupon> => {
  const { data } = await axios.post(`${API_URL}/api/coupons/validate`, { code, subtotal });
  return data;
};

const Cart: React.FC = () => {
  const { items, removeFromCart, clearCart, getTotalPrice, checkout } = useCart();
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- This query is now used to display the available coupons ---
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

  const couponMutation = useMutation({
    mutationFn: validateCoupon,
    onSuccess: (data) => {
      setAppliedCoupon(data);
      setCouponCodeInput(data.code); // Sync input field
      toast({
        title: 'Coupon Applied!',
        description: `Successfully applied code: ${data.code}`,
      });
    },
    onError: (error: any) => {
      setAppliedCoupon(null);
      toast({
        title: 'Invalid Coupon',
        description: error.response?.data?.message || 'The coupon code is not valid.',
        variant: 'destructive',
      });
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) {
      toast({ title: 'Please enter a coupon code.', variant: 'destructive' });
      return;
    }
    couponMutation.mutate({ code: couponCodeInput, subtotal: calculateSubtotal() });
  };
  
  // --- NEW: Function to handle clicking on an available coupon ---
  const handleSelectCoupon = (coupon: Coupon) => {
    // We can directly trigger the mutation with the coupon's code
    couponMutation.mutate({ code: coupon.code, subtotal: calculateSubtotal() });
  };
  
  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast({
        title: t('loginRequired'),
        description: t('loginRequiredDescription'),
        variant: "destructive",
      });
      return;
    }
    setPaymentModalOpen(true);
  };
  
  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      await checkout();
      setPaymentModalOpen(false);
      navigate('/my-courses');
      toast({
        title: 'Payment Successful!',
        description: 'You have been enrolled in the selected courses.',
      });
    } catch (error: any) {
      toast({
        title: 'Checkout Failed',
        description: error.message || 'An error occurred during payment.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center text-center">
          <div className="bg-muted p-10 rounded-full mb-6">
            <ShoppingCart className="w-24 h-24 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-heading mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">Looks like you haven't added any courses to your cart yet.</p>
          <Button onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            Start Shopping
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <ShoppingCart className="w-8 h-8" />
          {t('yourCart')}
        </h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.title} className="w-24 h-16 object-cover rounded-md" />
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.instructor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">{formatPrice(item.price)}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </div>
          <div>
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-semibold">Order Summary</h2>
                
                {/* --- NEW: Display available coupons if none are applied --- */}
                {!appliedCoupon && availableCoupons.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      Available Offers
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {availableCoupons.map((coupon) => {
                        const isEligible = calculateSubtotal() >= coupon.minAmount;
                        return (
                          <Badge
                            key={coupon._id}
                            variant={isEligible ? "default" : "secondary"}
                            onClick={isEligible ? () => handleSelectCoupon(coupon) : undefined}
                            className={isEligible ? "cursor-pointer hover:bg-primary/80" : "cursor-not-allowed opacity-60"}
                            title={!isEligible ? `Requires a minimum purchase of ${formatPrice(coupon.minAmount)}` : coupon.description}
                          >
                            {coupon.code}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Coupon Input Section - still available for manual entry */}
                {!appliedCoupon && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Input 
                      placeholder="Enter Coupon Code"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      disabled={couponMutation.isPending}
                    />
                    <Button onClick={handleApplyCoupon} disabled={couponMutation.isPending}>
                      {couponMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(calculateSubtotal())}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <div className="flex items-center gap-2">
                        <span>- {formatPrice(calculateDiscount())}</span>
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