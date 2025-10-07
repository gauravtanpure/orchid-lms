// /frontend/src/types/index.ts

export interface Course {
  _id: string; // MongoDB uses _id
  title: string;
  instructor: string;
  category: string;
  price: number;
  duration: number;
  enrollments: number;
  completionRate: number;
  thumbnailUrl: string;
  videoUrl: string;
  createdAt: string;
  
  // --- NEW: Special offer fields ---
  specialOffer: {
    isActive: boolean;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    description: string;
  };
}