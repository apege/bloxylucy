export interface RobuxItem {
  id: string;
  amount: number;
  bonus?: number;
  price: number;
  originalPrice?: number;
  isPopular?: boolean;
  isBestValue?: boolean;
  isPromo?: boolean;
}

export interface Testimonial {
  id: string | number;
  order_code?: string;
  username: string;
  rating: number;
  robuxPackage?: string;
  comment: string;
  timeAgo?: string;
  avatarLetter?: string;
  hasProof?: boolean;
  proofImage?: string | null;
  proofAmount?: string;
  adminReply?: {
    adminName: string;
    message: string;
  } | null;
  is_active?: boolean;
  created_at?: string;
}

export const ROBUX_PRICELIST: RobuxItem[] = [
  { id: 'rbx-1', amount: 400, price: 9000, originalPrice: 12000, isPopular: false, isBestValue: false, isPromo: false },
  { id: 'rbx-2', amount: 1000, price: 22000, originalPrice: 25000, isPopular: true, isBestValue: false, isPromo: false },
  { id: 'rbx-3', amount: 2200, price: 45000, originalPrice: 55000, isPopular: true, isBestValue: false, isPromo: true },
  { id: 'rbx-4', amount: 5000, price: 97000, originalPrice: 110000, isPopular: false, isBestValue: true, isPromo: false },
  { id: 'rbx-5', amount: 10000, price: 190000, originalPrice: 220000, isPopular: false, isBestValue: true, isPromo: false },
  { id: 'rbx-6', amount: 30500, price: 500000, originalPrice: 600000, isPopular: false, isBestValue: true, isPromo: false },
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [];
