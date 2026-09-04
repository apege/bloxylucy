import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Order } from '@/lib/admin-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('q') || searchParams.get('search') || '').toLowerCase().trim();
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('payment_status') || '';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 0;
    const includeFullProof = searchParams.get('include_proof') === 'true';

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('order_status', status);
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase get orders error, returning empty list:', error.message);
      return NextResponse.json({ success: true, data: [] });
    }

    let orders: Order[] = (data || []).map((item: any) => ({
      id: item.id,
      order_code: item.order_code || `BLX${item.id}`,
      product_id: item.product_id,
      user_id: item.user_id,
      roblox_username: item.roblox_username || 'Unknown',
      roblox_user_id: item.roblox_user_id || undefined,
      customer_phone: item.customer_phone || '',
      customer_email: item.customer_email || '',
      robux: item.robux || 0,
      price: item.price || 0,
      activation_fee: item.activation_fee || 0,
      total_payment: item.total_payment || item.price || 0,
      payment_method: item.payment_method || 'Website',
      payment_status: item.payment_status || 'pending',
      payment_proof_path: item.payment_proof_path
        ? (includeFullProof || !item.payment_proof_path.startsWith('data:')
            ? item.payment_proof_path
            : 'has_proof')
        : null,
      order_status: item.order_status || 'pending',
      customer_notes: item.customer_notes || '-',
      admin_notes: item.admin_notes || '',
      created_at: item.created_at || new Date().toISOString(),
      expires_at: item.expires_at,
      updated_at: item.updated_at,
    }));

    if (search) {
      orders = orders.filter(
        (o) =>
          o.order_code.toLowerCase().includes(search) ||
          o.roblox_username.toLowerCase().includes(search) ||
          (o.customer_phone && o.customer_phone.includes(search))
      );
    }

    if (limit > 0) {
      orders = orders.slice(0, limit);
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (err: any) {
    console.error('API Orders GET Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      roblox_username,
      robux,
      price,
      customer_phone,
      payment_status = 'pending',
      order_status = 'pending',
      payment_proof_path,
      product_id,
    } = body;

    if (!roblox_username || !robux || !price) {
      return NextResponse.json(
        { success: false, error: 'Username Roblox, nominal Robux, dan harga wajib diisi.' },
        { status: 400 }
      );
    }

    const orderCode = `BLX${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;

    const newOrderPayload = {
      order_code: orderCode,
      product_id: product_id || null,
      roblox_username: String(roblox_username).trim(),
      customer_phone: customer_phone ? String(customer_phone).trim() : '6285828378025',
      robux: Math.max(1, Number(robux)),
      price: Math.max(0, Number(price)),
      payment_method: 'qris',
      payment_status: payment_status === 'paid' ? 'paid' : (payment_status === 'failed' ? 'failed' : 'pending'),
      payment_proof_path: payment_proof_path || null,
      order_status: ['pending', 'processing', 'completed', 'cancelled'].includes(order_status) ? order_status : 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('orders').insert(newOrderPayload).select().single();

    if (error) {
      console.error('Supabase Insert Order error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error('API Orders POST Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
