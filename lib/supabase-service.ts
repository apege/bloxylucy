import { Order, Product, Customer, StoreSettings, DashboardStats } from './admin-types';
import { supabase } from './supabase';

export const INITIAL_MOCK_ORDERS: Order[] = [];
export const INITIAL_MOCK_PRODUCTS: Product[] = [];
export const INITIAL_MOCK_CUSTOMERS: Customer[] = [];

export const INITIAL_MOCK_SETTINGS: StoreSettings = {
  store_name: 'BloxyLucy Top Up Robux',
  whatsapp_number: '6287816959979',
  qris_image_path: '/images/qris.webp',
  logo_image_path: '/images/logo.jpeg',
  banner_image_path: '',
  promo_active: true,
  promo_tag: 'PROMO SPESIAL BULAN INI',
  promo_badge: 'LIMITED STOCK',
  promo_title: 'ROBUX BULAN INI',
  promo_subtitle: 'Top Up Robux Instant, Cepat, Legal, Aman & Bergaransi 100% Uang Kembali!',
  promo_robux_amount: 2200,
  promo_original_label: '2.000 Robux',
  promo_discount_price: 45000,
  promo_end_date: '2026-09-30T23:59:59.000Z',
};

// In-Memory & LocalStorage state for seamless live interactivity
const STORAGE_KEY_ORDERS = 'bloxylucy_admin_orders';
const STORAGE_KEY_PRODUCTS = 'bloxylucy_admin_products';
const STORAGE_KEY_CUSTOMERS = 'bloxylucy_admin_customers';
const STORAGE_KEY_SETTINGS = 'bloxylucy_admin_settings';

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

/* =========================================================================
   API CLIENT FUNCTIONS (Calls Next.js App Router /api/* Routes)
   ========================================================================= */

// 1. ORDERS API
export async function getOrders(params?: { search?: string; status?: string; payment_status?: string }): Promise<Order[]> {
  try {
    let url = '/api/orders';
    if (params) {
      const sp = new URLSearchParams();
      if (params.search) sp.set('search', params.search);
      if (params.status) sp.set('status', params.status);
      if (params.payment_status) sp.set('payment_status', params.payment_status);
      url += `?${sp.toString()}`;
    }

    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setLocal(STORAGE_KEY_ORDERS, json.data);
        return json.data;
      }
    }
  } catch (err) {
    console.warn('API fetch orders error, falling back to cache:', err);
  }

  return getLocal<Order[]>(STORAGE_KEY_ORDERS, INITIAL_MOCK_ORDERS);
}

export async function getOrderById(idOrCode: string | number): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${idOrCode}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('API get order by id error:', err);
  }

  const orders = await getOrders();
  return orders.find(
    (o) =>
      String(o.id) === String(idOrCode) ||
      o.order_code.toLowerCase() === String(idOrCode).toLowerCase() ||
      o.order_code.toLowerCase().replace('#', '') === String(idOrCode).toLowerCase().replace('#', '')
  ) || null;
}

export async function createOrder(orderPayload: Partial<Order>): Promise<Order | null> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const current = getLocal<Order[]>(STORAGE_KEY_ORDERS, INITIAL_MOCK_ORDERS);
        setLocal(STORAGE_KEY_ORDERS, [json.data, ...current]);
        return json.data;
      }
    }
  } catch (err) {
    console.warn('API create order error:', err);
  }
  return null;
}

export async function updateOrderStatus(orderId: number | string, newStatus: Order['order_status']): Promise<boolean> {
  try {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_status: newStatus }),
    });
  } catch (err) {
    console.warn('API update order status error:', err);
  }

  const current = getLocal<Order[]>(STORAGE_KEY_ORDERS, INITIAL_MOCK_ORDERS);
  const updated = current.map((o) =>
    String(o.id) === String(orderId) || o.order_code === String(orderId)
      ? { ...o, order_status: newStatus, updated_at: new Date().toISOString() }
      : o
  );
  setLocal(STORAGE_KEY_ORDERS, updated);
  return true;
}

export async function updateAdminNotes(orderId: number | string, notes: string): Promise<boolean> {
  try {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes: notes }),
    });
  } catch (err) {
    console.warn('API update admin notes error:', err);
  }

  const current = getLocal<Order[]>(STORAGE_KEY_ORDERS, INITIAL_MOCK_ORDERS);
  const updated = current.map((o) =>
    String(o.id) === String(orderId) || o.order_code === String(orderId)
      ? { ...o, admin_notes: notes, updated_at: new Date().toISOString() }
      : o
  );
  setLocal(STORAGE_KEY_ORDERS, updated);
  return true;
}

// 2. PRODUCTS API
export async function getProducts(params?: { active_only?: boolean; category?: string }): Promise<Product[]> {
  try {
    let url = '/api/products';
    if (params) {
      const sp = new URLSearchParams();
      if (params.active_only) sp.set('active_only', 'true');
      if (params.category) sp.set('category', params.category);
      url += `?${sp.toString()}`;
    }

    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setLocal(STORAGE_KEY_PRODUCTS, json.data);
        return json.data;
      }
    }
  } catch (err) {
    console.warn('API fetch products error:', err);
  }

  return getLocal<Product[]>(STORAGE_KEY_PRODUCTS, INITIAL_MOCK_PRODUCTS);
}

export async function saveProduct(product: Partial<Product>): Promise<Product> {
  try {
    if (product.id) {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const current = await getProducts();
          const updated = current.map((p) => (p.id === product.id ? json.data : p));
          setLocal(STORAGE_KEY_PRODUCTS, updated);
          return json.data;
        }
      }
    } else {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const current = await getProducts();
          const updated = [...current, json.data];
          setLocal(STORAGE_KEY_PRODUCTS, updated);
          return json.data;
        }
      }
    }
  } catch (err) {
    console.warn('API save product error:', err);
  }

  const current = await getProducts();
  let updated: Product[];
  if (product.id) {
    updated = current.map((p) => (p.id === product.id ? ({ ...p, ...product } as Product) : p));
  } else {
    const newId = Math.max(0, ...current.map((p) => p.id)) + 1;
    const newProd: Product = {
      id: newId,
      name: product.name || `${product.robux} Robux`,
      robux: product.robux || 0,
      price: product.price || 0,
      is_active: product.is_active ?? true,
      category: product.category || 'Robux',
    };
    updated = [...current, newProd];
  }
  setLocal(STORAGE_KEY_PRODUCTS, updated);
  return updated.find((p) => p.id === product.id) || updated[updated.length - 1];
}

export async function deleteProduct(id: number): Promise<boolean> {
  try {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('API delete product error:', err);
  }

  const current = await getProducts();
  const updated = current.filter((p) => p.id !== id);
  setLocal(STORAGE_KEY_PRODUCTS, updated);
  return true;
}

// 3. CUSTOMERS API
export async function getCustomers(params?: { blacklist_only?: boolean }): Promise<Customer[]> {
  try {
    let url = '/api/customers';
    if (params?.blacklist_only) url += '?blacklist_only=true';

    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setLocal(STORAGE_KEY_CUSTOMERS, json.data);
        return json.data;
      }
    }
  } catch (err) {
    console.warn('API fetch customers error:', err);
  }

  return getLocal<Customer[]>(STORAGE_KEY_CUSTOMERS, INITIAL_MOCK_CUSTOMERS);
}

export async function toggleCustomerBlacklist(id: string): Promise<boolean> {
  const current = await getCustomers();
  const target = current.find((c) => c.id === id);
  const newBlacklist = !target?.is_blacklisted;

  try {
    await fetch('/api/customers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_blacklisted: newBlacklist }),
    });
  } catch (err) {
    console.warn('API toggle blacklist error:', err);
  }

  const updated = current.map((c) =>
    c.id === id ? { ...c, is_blacklisted: newBlacklist } : c
  );
  setLocal(STORAGE_KEY_CUSTOMERS, updated);
  return true;
}

// 4. SETTINGS API
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        setLocal(STORAGE_KEY_SETTINGS, json.data);
        return json.data;
      }
    }
  } catch (err) {
    console.warn('API fetch settings error:', err);
  }

  const local = getLocal<StoreSettings>(STORAGE_KEY_SETTINGS, INITIAL_MOCK_SETTINGS);
  return {
    ...INITIAL_MOCK_SETTINGS,
    ...local,
    promo_active: local.promo_active !== undefined ? Boolean(local.promo_active) : true,
  };
}

export async function saveStoreSettings(settings: StoreSettings): Promise<boolean> {
  setLocal(STORAGE_KEY_SETTINGS, settings);
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        setLocal(STORAGE_KEY_SETTINGS, json.data);
      }
    }
  } catch (err) {
    console.warn('API save settings error:', err);
  }
  return true;
}

// 5. CHECKOUT FLOW API
export async function submitCheckout(payload: {
  roblox_username: string;
  roblox_user_id?: string;
  amount: number;
  price: number;
  activation_fee?: number;
  payment_method?: string;
  payment_proof_path?: string | null;
  customer_phone?: string;
  customer_email?: string;
  customer_notes?: string;
  cart_items?: any[];
}): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) {
      if (json.order) {
        const current = getLocal<Order[]>(STORAGE_KEY_ORDERS, INITIAL_MOCK_ORDERS);
        setLocal(STORAGE_KEY_ORDERS, [json.order, ...current]);
      }
      return { success: true, order: json.order };
    }
    return { success: false, error: json.error || 'Gagal memproses pesanan' };
  } catch (err: any) {
    console.warn('API checkout error:', err);
    return { success: false, error: err.message };
  }
}

// 6. DASHBOARD STATS HELPER
export function computeDashboardStats(orders: Order[]): DashboardStats {
  const pendingOrdersCount = orders.filter((o) => o.order_status === 'pending' || o.order_status === 'awaiting_activation').length;
  const processingOrdersCount = orders.filter((o) => o.order_status === 'processing').length;
  const completedOrdersCount = orders.filter((o) => o.order_status === 'completed').length;
  const cancelledOrdersCount = orders.filter((o) => o.order_status === 'cancelled').length;

  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid' || o.order_status === 'completed')
    .reduce((acc, curr) => acc + (curr.total_payment || curr.price || 0), 0);

  return {
    totalRevenue,
    totalOrders: orders.length,
    pendingOrdersCount,
    processingOrdersCount,
    completedOrdersCount,
    cancelledOrdersCount,
  };
}
