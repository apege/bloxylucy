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

export const ROBUX_PRICELIST: RobuxItem[] = [];

export const INITIAL_TESTIMONIALS: Testimonial[] = [];
