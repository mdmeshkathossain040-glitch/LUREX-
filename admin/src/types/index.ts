export interface AnalyticsData {
  total_buyers: string | number;
  total_sellers: string | number;
  total_approved_shops: string | number;
  pending_shops: string | number;
  total_products: string | number;
  total_orders: string | number;
  total_paid_orders: string | number;
  gross_merchandise_volume: string | number;
  total_marketplace_commission: string | number;
  pending_withdrawals: string | number;
  total_paid_withdrawals: string | number;
}

export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  seller_id: string;
  seller_name?: string;
  seller_phone?: string;
  seller_email?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rating: number;
  total_sales: number;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  seller_id: string;
  seller_name?: string;
  seller_phone?: string;
  amount: number;
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected';
  account_type: string;
  account_number: string;
  bank_name?: string;
  branch_name?: string;
  routing_number?: string;
  requested_at: string;
  processed_at?: string;
  transaction_ref?: string;
}
