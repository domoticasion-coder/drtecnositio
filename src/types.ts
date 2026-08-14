// Types definition for Dr Tecno e-commerce app

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  collection: string | null;
  brand: string | null;
  price: number;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  images: string[]; // Additional images URLs
  specifications: Record<string, string>;
  stock: number;
  featured: boolean;
  badge: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  created_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  delivery_method: string | null;
  notes: string | null;
  subtotal: number;
  total: number;
  status: 'En preparación' | 'Probado' | 'Despachado' | 'Entregado' | 'Cancelado';
  items_count: number;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at?: string;
}

export interface ServiceRequest {
  id: string;
  request_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  device_type: 'Celular' | 'PC de escritorio' | 'Notebook';
  service_type: 'Reparación' | 'Mantenimiento';
  brand: string | null;
  model: string | null;
  customer_dni?: string | null;
  problem_description: string;
  diagnosis: string | null;
  estimated_price: number | null;
  internal_notes: string | null;
  estimated_delivery_date: string | null;
  delivered_at: string | null;
  status: 'Pendiente' | 'En diagnóstico' | 'Esperando aprobación' | 'En proceso' | 'Listo' | 'Entregado' | 'Cancelado';
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string | null;
}

export interface Collection {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  bg_url: string;
  items_list: string[];
  created_at?: string;
  updated_at?: string;
}

export interface MercadoPagoConfigData {
  accessToken: string;
  publicKey: string;
  sandbox?: boolean;
  configured: boolean;
  updated_at?: string;
}
