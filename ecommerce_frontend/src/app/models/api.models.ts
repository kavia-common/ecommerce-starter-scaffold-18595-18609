export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  image_url: string | null;
  price_cents: number;
  currency_code: string;
  active: boolean;
  quantity: number;
  reserved: number;
}

export interface CreateCartResponse {
  cart_id: number;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  unit_price_cents: number;
  currency_code: string;
  product?: Product | null;
}

export interface Cart {
  id: number;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
  items: CartItem[];
  subtotal_cents: number;
  currency_code: string;
}

export interface AddItemRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateItemQuantityRequest {
  quantity: number;
}

export interface CheckoutRequest {
  customer_email?: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number | null;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
  currency_code: string;
}

export interface Order {
  id: number;
  cart_id?: number | null;
  status: string;
  customer_email?: string | null;
  subtotal_cents: number;
  tax_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency_code: string;
  created_at?: string | null;
  updated_at?: string | null;
  items: OrderItem[];
}
