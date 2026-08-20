import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Customer } from '@/lib/admin-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blacklistOnly = searchParams.get('blacklist_only') === 'true';

    // 1. Fetch blacklists table
    const { data: blacklists } = await supabase.from('blacklists').select('*');
    const blacklistedSet = new Set<string>();
    const blacklistReasonMap = new Map<string, string>();
    (blacklists || []).forEach((b: any) => {
      if (b.roblox_username) {
        const u = b.roblox_username.toLowerCase();
        blacklistedSet.add(u);
        blacklistReasonMap.set(u, b.reason || 'Indikasi penipuan atau penyalahgunaan');
      }
    });

    // 2. Fetch profiles
    const { data: profiles } = await supabase.from('profiles').select('*');

    // 3. Fetch orders to compute total_orders and total_spent
    const { data: orders } = await supabase.from('orders').select('*');

    const customerMap = new Map<string, Customer>();

    (profiles || []).forEach((p: any) => {
      const u = p.roblox_username || p.id;
      const isBl = Boolean(p.is_blacklisted) || blacklistedSet.has(u.toLowerCase());
      customerMap.set(u, {
        id: p.id,
        roblox_username: p.roblox_username || 'Unknown',
        roblox_user_id: p.roblox_user_id || '',
        email: p.email || '',
        phone: p.phone || '',
        role: p.role || 'member',
        is_blacklisted: isBl,
        total_orders: 0,
        total_spent: 0,
        created_at: p.created_at || new Date().toISOString(),
      });
    });

    // Populate stats from orders AND fill missing roblox_user_id & phone
    (orders || []).forEach((o: any) => {
      const username = o.roblox_username || 'Unknown';
      const uLower = username.toLowerCase();
      const isBl = blacklistedSet.has(uLower);

      if (!customerMap.has(username)) {
        customerMap.set(username, {
          id: `c-${username}`,
          roblox_username: username,
          roblox_user_id: o.roblox_user_id || '',
          email: o.customer_email || '',
          phone: o.customer_phone || '',
          role: 'member',
          is_blacklisted: isBl,
          total_orders: 0,
          total_spent: 0,
          created_at: o.created_at || new Date().toISOString(),
        });
      }

      const c = customerMap.get(username)!;
      if (isBl) c.is_blacklisted = true;

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

    // Also include any blacklisted username that doesn't have orders yet, or enrich existing customer
    (blacklists || []).forEach((b: any) => {
      if (!b.roblox_username) return;
      const bUsername = b.roblox_username;
      
      if (!customerMap.has(bUsername)) {
        customerMap.set(bUsername, {
          id: `bl-${b.id || bUsername}`,
          roblox_username: bUsername,
          roblox_user_id: b.roblox_user_id || '',
          email: '',
          phone: b.phone || '',
          role: 'member',
          is_blacklisted: true,
          total_orders: 0,
          total_spent: 0,
          created_at: b.created_at || new Date().toISOString(),
        });
      } else {
        const c = customerMap.get(bUsername)!;
        c.is_blacklisted = true;
        if (!c.phone && b.phone) c.phone = b.phone;
        if (!c.roblox_user_id && b.roblox_user_id) c.roblox_user_id = b.roblox_user_id;
      }
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
    const { id, username, roblox_username, roblox_user_id, phone, is_blacklisted, reason } = body;

    const rawName = roblox_username || username || (id && String(id).startsWith('c-') ? id.replace('c-', '') : id);
    if (!rawName) {
      return NextResponse.json({ success: false, error: 'Username Roblox wajib diisi' }, { status: 400 });
    }

    const cleanUsername = String(rawName).trim();
    const shouldBlacklist = Boolean(is_blacklisted);

    if (shouldBlacklist) {
      // Auto-lookup roblox_user_id and phone from orders if missing
      let finalRobloxUserId = roblox_user_id ? String(roblox_user_id).trim() : '';
      let finalPhone = phone ? String(phone).trim() : '';

      if (!finalRobloxUserId || !finalPhone) {
        const { data: latestOrder } = await supabase
          .from('orders')
          .select('roblox_user_id, customer_phone')
          .ilike('roblox_username', cleanUsername)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestOrder) {
          if (!finalRobloxUserId && latestOrder.roblox_user_id) {
            finalRobloxUserId = String(latestOrder.roblox_user_id);
          }
          if (!finalPhone && latestOrder.customer_phone) {
            finalPhone = String(latestOrder.customer_phone);
          }
        }
      }

      // Try full upsert with roblox_username, roblox_user_id, phone
      const fullBlacklistPayload: Record<string, any> = {
        roblox_username: cleanUsername,
        reason: reason || 'Indikasi penipuan atau penyalahgunaan',
        created_at: new Date().toISOString(),
      };
      if (finalRobloxUserId) fullBlacklistPayload.roblox_user_id = finalRobloxUserId;
      if (finalPhone) fullBlacklistPayload.phone = finalPhone;

      let { error: blErr } = await supabase
        .from('blacklists')
        .upsert(fullBlacklistPayload, { onConflict: 'roblox_username' });

      // Resilient fallback if phone or roblox_user_id columns not added yet
      if (blErr) {
        const basicPayload = {
          roblox_username: cleanUsername,
          reason: reason || 'Indikasi penipuan atau penyalahgunaan',
          created_at: new Date().toISOString(),
        };
        const retry = await supabase
          .from('blacklists')
          .upsert(basicPayload, { onConflict: 'roblox_username' });

        if (retry.error) {
          console.error('Supabase blacklists upsert error:', retry.error);
        }
      }
    } else {
      // 2. Delete from blacklists table
      let delQuery = supabase.from('blacklists').delete().ilike('roblox_username', cleanUsername);
      await delQuery;

      if (roblox_user_id) {
        try {
          await supabase.from('blacklists').delete().eq('roblox_user_id', String(roblox_user_id));
        } catch {}
      }
      if (phone) {
        try {
          await supabase.from('blacklists').delete().ilike('phone', String(phone));
        } catch {}
      }
    }

    // 3. Try to update profiles table if row exists
    try {
      await supabase
        .from('profiles')
        .update({ is_blacklisted: shouldBlacklist })
        .ilike('roblox_username', cleanUsername);
    } catch {}

    return NextResponse.json({
      success: true,
      message: shouldBlacklist
        ? `Akun @${cleanUsername} berhasil dimasukkan ke daftar blacklist`
        : `Akun @${cleanUsername} berhasil dihapus dari daftar blacklist`,
    });
  } catch (err: any) {
    console.error('API Customers PATCH Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Allow manual blacklist addition via POST
  return PATCH(req);
}
