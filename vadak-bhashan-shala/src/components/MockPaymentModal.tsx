// /frontend/src/components/MockPaymentModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext'; // ADD: Import useCart
// Assuming you have a useToast hook for feedback
// import { useToast } from '@/hooks/use-toast'; 

interface MockPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalAmount: number;
}

export const MockPaymentModal: React.FC<MockPaymentModalProps> = ({ isOpen, onClose, onConfirm, totalAmount }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { checkout } = useCart(); // FIX: Use checkout from cart
  // const { toast } = useToast(); 

  const handlePayment = async () => { // FIX: Make function async
    setIsProcessing(true);
    
    try {
        // Simulate a 1-second payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        
        // CRITICAL FIX: Perform enrollment and state update via checkout()
        await checkout(); 
        
        // onConfirm is called only if checkout is successful
        onConfirm(); 
        
        // Use toast for user feedback if available
        /* toast({
            title: "Payment Successful",
            description: "You have been enrolled in the courses!",
            variant: "success",
        }); */
        alert("Payment Successful! You are now enrolled.");

    } catch (error) {
        console.error('Payment/Enrollment failed:', error);
        // Use toast for user feedback if available
        /* toast({
            title: "Payment Failed",
            description: error.message || "An unexpected error occurred during enrollment.",
            variant: "destructive",
        }); */
        alert(`Enrollment failed: ${error.message}`);
    } finally {
        setIsProcessing(false);
        onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CreditCard /> Secure Checkout</DialogTitle>
          <DialogDescription>This is a demo payment gateway. No real payment will be processed.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <Input id="card-number" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry</Label>
              <Input id="expiry" placeholder="MM/YY" defaultValue="12/28" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" placeholder="123" defaultValue="123" />
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-muted-foreground">Total Amount</p>
            <p className="text-3xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isProcessing ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};