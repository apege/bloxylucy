export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'awaiting_activation';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: number | string;
  order_code: string;
  product_id?: number | null;
  user_id?: string | null;
  roblox_username: string;
  roblox_user_id?: string;
  customer_phone?: string;
  customer_email?: string;
  robux: number;
  price: number;
  activation_fee?: number;
  total_payment?: number;
  payment_method: string;
  payment_status: PaymentStatus;
  payment_proof_path?: string | null;
  order_status: OrderStatus;
  customer_notes?: string;
  admin_notes?: string;
  created_at: string;
  expires_at?: string | null;
  updated_at?: string;
}

export function isWhatsAppOrder(order: { payment_method?: string; customer_notes?: string | null; admin_notes?: string | null } | null | undefined): boolean {
  if (!order) return false;
  const m = (order.payment_method || '').toLowerCase();
  const c = (order.customer_notes || '').toLowerCase();
  const a = (order.admin_notes || '').toLowerCase();
  return (
    m.includes('whatsapp') ||
    m === 'wa' ||
    m.startsWith('wa') ||
    c.includes('whatsapp') ||
    c.includes('wa') ||
    a.includes('whatsapp') ||
    a.includes('wa')
  );
}

export interface StorageCleanupLog {
  id: number;
  cleaned_count: number;
  order_codes: string[];
  mode: 'cron' | 'manual' | 'auto_check';
  executed_by?: string;
  details?: any;
  created_at: string;
}

export interface StorageRetentionStats {
  totalWithProof: number;
  activeCount: number;
  expiringSoonCount: number; // H-7 (83-90 hari)
  expiredCount: number; // >90 hari
  expiringSoonOrders: Order[];
  expiredOrders: Order[];
  recentLogs: StorageCleanupLog[];
}

export interface Product {
  id: number;
  name: string;
  robux: number;
  price: number;
  original_price?: number;
  is_active: boolean;
  is_popular?: boolean;
  is_best_value?: boolean;
  is_promo?: boolean;
  category?: string;
  image_path?: string | null;
  created_at?: string;
  updated_at?: string;
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

export interface Customer {
  id: string;
  full_name?: string;
  roblox_username: string;
  roblox_user_id?: string;
  email?: string;
  phone?: string;
  role: string;
  is_blacklisted?: boolean;
  total_orders?: number;
  total_spent?: number;
  created_at: string;
}

export interface StoreSettings {
  id?: number;
  store_name: string;
  whatsapp_number: string;
  qris_image_path?: string;
  logo_image_path?: string;
  banner_image_path?: string;
  promo_active?: boolean;
  promo_tag?: string;
  promo_badge?: string;
  promo_title?: string;
  promo_subtitle?: string;
  promo_robux_amount?: number;
  promo_original_label?: string;
  promo_discount_price?: number;
  promo_end_date?: string;
  updated_at?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrdersCount: number;
  processingOrdersCount: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
}
