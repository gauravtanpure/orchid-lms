// /frontend/src/pages/admin/ManageCoupons.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Loader2, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';

const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:5000';

interface Coupon {
  _id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  description: string;
  minAmount: number;
  isActive: boolean;
}

// API functions
const fetchAllCoupons = async (): Promise<Coupon[]> => {
  const { data } = await axios.get(`${API_URL}/api/coupons/all`);
  return data;
};

const createCoupon = async (couponData: Omit<Coupon, '_id' | 'isActive'>) => {
  const { data } = await axios.post(`${API_URL}/api/coupons`, couponData);
  return data;
};

const deleteCoupon = async (id: string) => {
  await axios.delete(`${API_URL}/api/coupons/${id}`);
};

const ManageCoupons: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCouponData, setNewCouponData] = useState({
    code: '', description: '', discount: '', type: 'percentage' as 'percentage' | 'fixed', minAmount: ''
  });

  const { data: coupons = [], isLoading, isError } = useQuery<Coupon[]>({
    queryKey: ['allCoupons'],
    queryFn: fetchAllCoupons,
  });

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCoupons'] });
      toast({ title: "Success", description: "Coupon created successfully!" });
      setIsDialogOpen(false);
      setNewCouponData({ code: '', description: '', discount: '', type: 'percentage', minAmount: '' });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to create coupon." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCoupons'] });
      toast({ title: "Success", description: "Coupon deleted successfully!" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to delete coupon." });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCouponData({ ...newCouponData, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (value: "percentage" | "fixed") => {
    setNewCouponData({ ...newCouponData, type: value });
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
        ...newCouponData,
        discount: Number(newCouponData.discount),
        minAmount: Number(newCouponData.minAmount)
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Coupons</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Coupon</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Coupon</DialogTitle>
              <DialogDescription>Fill in the details to create a new discount coupon.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCoupon} className="space-y-4 py-4">
              <Input name="code" placeholder="Coupon Code (e.g., WELCOME20)" value={newCouponData.code} onChange={handleInputChange} required />
              <Input name="description" placeholder="Description (e.g., 20% off for new users)" value={newCouponData.description} onChange={handleInputChange} required />
              <div className="flex gap-4">
                <Input name="discount" type="number" placeholder="Discount Value" value={newCouponData.discount} onChange={handleInputChange} className="flex-1" required />
                <Select onValueChange={handleSelectChange} defaultValue={newCouponData.type}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">% Percentage</SelectItem>
                    <SelectItem value="fixed">₹ Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input name="minAmount" type="number" placeholder="Minimum Purchase Amount (₹)" value={newCouponData.minAmount} onChange={handleInputChange} />
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Coupon
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min. Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={6} className="text-center p-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>}
              {isError && <TableRow><TableCell colSpan={6} className="text-center text-destructive">Failed to load coupons.</TableCell></TableRow>}
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-medium"><Badge variant="secondary">{coupon.code}</Badge></TableCell>
                  <TableCell className="capitalize">{coupon.type}</TableCell>
                  <TableCell>{coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}</TableCell>
                  <TableCell>₹{coupon.minAmount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive ? 'default' : 'outline'}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="mr-2" disabled>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(coupon._id)} disabled={deleteMutation.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageCoupons;