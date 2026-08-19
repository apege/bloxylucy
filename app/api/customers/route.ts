import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Customer } from '@/lib/admin-types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blacklistOnly = searchParams.get('blacklist_only') === 'true';

    // 1. Fetch profiles
    const { data: profiles, error } = await supabase.from('profiles').select('*');

    // 2. Fetch orders to compute total_orders and total_spent
    const { data: orders } = await supabase.from('orders').select('*');

    const customerMap = new Map<string, Customer>();

    (profiles || []).forEach((p: any) => {
      customerMap.set(p.roblox_username || p.id, {
        id: p.id,
        roblox_username: p.roblox_username || 'Unknown',
        roblox_user_id: p.roblox_user_id || '',
        email: p.email || '',
        phone: p.phone || '',
        role: p.role || 'member',
        is_blacklisted: Boolean(p.is_blacklisted),
        total_orders: 0,
        total_spent: 0,
        created_at: p.created_at || new Date().toISOString(),
      });
    });

    // Populate stats from orders AND fill missing roblox_user_id & phone
    (orders || []).forEach((o: any) => {
      const username = o.roblox_username || 'Unknown';
      if (!customerMap.has(username)) {
        customerMap.set(username, {
          id: `c-${username}`,
          roblox_username: username,
          roblox_user_id: o.roblox_user_id || '',
          email: o.customer_email || '',
          phone: o.customer_phone || '',
          role: 'member',
          is_blacklisted: false,
          total_orders: 0,
          total_spent: 0,
          created_at: o.created_at || new Date().toISOString(),
        });
      }

      const c = customerMap.get(username)!;

      // Fill in roblox_user_id and phone from order if still missing
      if (!c.roblox_user_id && o.roblox_user_id) {
        c.roblox_user_id = o.roblox_user_id;
      }
      if (!c.phone && o.customer_phone) {
        c.phone = o.customer_phone;
      }

      c.total_orders = (c.total_orders || 0) + 1;
      c.total_spent = (c.total_spent || 0) + (o.price || 0);
    });

    let customerList = Array.from(customerMap.values());

    if (blacklistOnly) {
      customerList = customerList.filter((c) => c.is_blacklisted);
    }

    return NextResponse.json({ success: true, data: customerList });
  } catch (err: any) {
    console.error('API Customers GET Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_blacklisted } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID customer wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_blacklisted: Boolean(is_blacklisted) })
      .eq('id', id)
      .select();

    if (error) {
      console.warn('Supabase profile update warning:', error.message);
    }

    return NextResponse.json({ success: true, message: 'Status blacklist customer berhasil diperbarui' });
  } catch (err: any) {
    console.error('API Customers PATCH Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
