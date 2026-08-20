import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      roblox_username,
      roblox_user_id,
      amount,
      price,
      customer_phone,
      payment_proof_path,
      customer_notes,
    } = body;

    if (!roblox_username || !amount || !price) {
      return NextResponse.json(
        { success: false, error: 'Data pemesanan tidak lengkap (Username, Robux, dan Harga wajib ada).' },
        { status: 400 }
      );
    }

    const cleanUsername = String(roblox_username).trim();
    let cleanPhone = String(customer_phone || '').trim();
    if (!cleanPhone) {
      cleanPhone = '6287816959979';
    }

    // Auto-resolve Roblox User ID if not provided
    let finalRobloxUserId = roblox_user_id ? String(roblox_user_id).trim() : null;
    if (!finalRobloxUserId && cleanUsername) {
      try {
        const robloxRes = await fetch('https://users.roblox.com/v1/usernames/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            usernames: [cleanUsername],
            excludeBannedUsers: false,
          }),
          cache: 'no-store',
        });
        if (robloxRes.ok) {
          const robloxData = await robloxRes.json();
          if (robloxData.data && robloxData.data.length > 0) {
            finalRobloxUserId = String(robloxData.data[0].id);
          }
        }
      } catch (robloxErr) {
        console.warn('Auto resolve Roblox User ID notice:', robloxErr);
      }
    }

    // Generate unique order code (BLX + 6 digits + 2 digits)
    const orderCode = `BLX${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const fullPayload: Record<string, any> = {
      order_code: orderCode,
      roblox_username: cleanUsername,
      customer_phone: cleanPhone,
      robux: Math.max(1, Number(amount)),
      price: Math.max(0, Number(price)),
      payment_method: 'qris', // Strict match with check constraint
      payment_status: payment_proof_path ? 'paid' : 'pending',
      payment_proof_path: payment_proof_path || null,
      order_status: payment_proof_path ? 'processing' : 'pending',
      roblox_user_id: finalRobloxUserId,
      customer_notes: customer_notes ? String(customer_notes).trim() : null,
      created_at: now.toISOString(),
      expires_at: expiresAt,
      updated_at: now.toISOString(),
    };

    // Try insert with full fields
    let { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(fullPayload)
      .select()
      .single();

    // Resilient fallback if custom columns (roblox_user_id / customer_notes) do not exist in DB yet
    if (orderError) {
      const basicPayload = {
        order_code: orderCode,
        roblox_username: cleanUsername,
        customer_phone: cleanPhone,
        robux: Math.max(1, Number(amount)),
        price: Math.max(0, Number(price)),
        payment_method: 'qris',
        payment_status: payment_proof_path ? 'paid' : 'pending',
        payment_proof_path: payment_proof_path || null,
        order_status: payment_proof_path ? 'processing' : 'pending',
        created_at: now.toISOString(),
        expires_at: expiresAt,
        updated_at: now.toISOString(),
      };

      const retry = await supabase
        .from('orders')
        .insert(basicPayload)
        .select()
        .single();

      if (retry.error) {
        console.error('Supabase checkout insert error:', retry.error);
        return NextResponse.json(
          { success: false, error: `Gagal menyimpan pesanan ke database: ${retry.error.message}` },
          { status: 500 }
        );
      }

      orderData = {
        ...retry.data,
        roblox_user_id: finalRobloxUserId,
        customer_notes: customer_notes || null,
      };
    }

    return NextResponse.json({
      success: true,
      order: orderData,
      message: 'Pesanan berhasil dibuat.',
    });
  } catch (err: any) {
    console.error('API Checkout Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
