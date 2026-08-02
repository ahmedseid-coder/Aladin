export type UserRole = 'clinic' | 'sales' | 'admin';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  clinic_name?: string;
  phone?: string;
  notes?: string;
  apiKey?: string;
  scopes?: string[];
  is_active: boolean;
}

export type ProductCategory = 
  | 'Condoms' 
  | 'Emergency Contraceptives' 
  | 'Oral Contraceptives' 
  | 'Injectables' 
  | 'LARCs' 
  | 'Safe Abortion and PPH' 
  | 'Others';

export interface Product {
  id: number;
  product_code: string;
  name: string;
  unit: string;
  qty_per_pack: number;
  selling_price_birr: number;
  per_pack_trade: number;
  category: ProductCategory;
  is_active: boolean;
  min_order_pack?: number;
  description?: string;
}

export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'delivered';
export type UrgencyLevel = 'routine' | 'urgent' | 'emergency_stockout';
export type AuthMethod = 'jwt_bearer' | 'api_key' | 'session';

export interface DemandOrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product_code: string;
  name: string;
  unit: string;
  quantity_requested: number;
  unit_price: number;
  total_price: number;
}

export interface DemandRequest {
  id: number;
  order_number: string;
  clinic_id: number;
  clinic_name: string;
  clinic_rep: string;
  sales_rep_id?: number | null;
  sales_rep_name?: string | null;
  status: OrderStatus;
  urgency: UrgencyLevel;
  notes?: string;
  rejection_reason?: string;
  total_amount: number;
  checksum: string;
  auth_method: AuthMethod;
  order_date: string;
  review_date?: string | null;
  delivery_date?: string | null;
  delivered_by?: string | null;
  items: DemandOrderItem[];
}

export interface SmsLog {
  id: number;
  phone: string;
  message: string;
  direction: 'outgoing' | 'incoming';
  status: 'sent' | 'delivered' | 'failed' | 'received';
  reference: string;
  created_at: string;
}

export interface ApiToken {
  id: string;
  client_id: string;
  name: string;
  token: string;
  created_at: string;
  expires_at: string;
  scopes: string[];
  key_prefix: string;
}

export interface ForecastItem {
  product_code: string;
  product_name: string;
  category: string;
  recommended_qty: number;
  reasoning: string;
  urgency: 'routine' | 'urgent' | 'emergency';
}

export interface DemandForecastResult {
  clinic_name: string;
  stockout_risk_score: number; // 0-100
  clinical_insight: string;
  suggested_orders: ForecastItem[];
}
