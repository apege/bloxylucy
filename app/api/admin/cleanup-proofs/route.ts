import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { RETENTION_DAYS } from '@/lib/storage-retention';

export async function GET(req: NextRequest) {
  try {
    const nowIso = new Date().toISOString();
    const warningThresholdIso = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const ninetyDaysAgoIso = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // Fetch all orders with proof (Exclude massive base64 payment_proof_path string to prevent statement timeout)
    const { data: ordersWithProof, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id, order_code, roblox_username, robux, price, payment_status, order_status, created_at, expires_at')
      .not('payment_proof_path', 'is', null)
      .order('created_at', { ascending: true })
      .limit(500);

    if (ordersError) {
      console.error('Supabase fetch orders with proof error:', ordersError);
      return NextResponse.json({ success: false, error: ordersError.message }, { status: 500 });
    }

    const allOrders = ordersWithProof || [];
    const expiringSoonOrders: any[] = [];
    const expiredOrders: any[] = [];
    let activeCount = 0;

    for (const order of allOrders) {
      const expiresAt = order.expires_at
        ? new Date(order.expires_at).getTime()
        : new Date(order.created_at).getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000;
      
      const diffDays = Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        expiredOrders.push(order);
      } else if (diffDays <= 7) {
        expiringSoonOrders.push(order);
      } else {
        activeCount++;
      }
    }

    // Fetch recent cleanup logs
    const { data: logsData } = await supabaseAdmin
      .from('storage_cleanup_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      stats: {
        totalWithProof: allOrders.length,
        activeCount,
        expiringSoonCount: expiringSoonOrders.length,
        expiredCount: expiredOrders.length,
        expiringSoonOrders,
        expiredOrders,
        recentLogs: logsData || [],
      },
    });
  } catch (err: any) {
    console.error('API Admin Cleanup Proofs GET error:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'manual';
    const executedBy = body.executed_by || 'admin';

    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Find all eligible orders with expired proof (> 90 days)
    // Safe check: either expires_at <= NOW() OR (expires_at is null AND created_at <= 90 days ago)
    const { data: expiredOrders, error: findError } = await supabaseAdmin
      .from('orders')
      .select('id, order_code, created_at, expires_at')
      .not('payment_proof_path', 'is', null)
      .limit(500);

    if (findError) {
      console.error('Failed to find expired orders:', findError);
      return NextResponse.json({ success: false, error: findError.message }, { status: 500 });
    }

    const targetOrders = (expiredOrders || []).filter((o) => {
      const expiresAt = o.expires_at
        ? new Date(o.expires_at).getTime()
        : new Date(o.created_at).getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000;
      return expiresAt <= now.getTime();
    });

    if (targetOrders.length === 0) {
      return NextResponse.json({
        success: true,
        cleaned_count: 0,
        message: 'Tidak ada foto bukti transfer yang kedaluwarsa (> 90 hari).',
      });
    }

    const orderIds = targetOrders.map((o) => o.id);
    const orderCodes = targetOrders.map((o) => o.order_code);

    // 2. Safe cleanup: ONLY set payment_proof_path = NULL. Retain all transaction data intact.
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_proof_path: null,
        updated_at: nowIso,
      })
      .in('id', orderIds);

    if (updateError) {
      console.error('Supabase cleanup update error:', updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // 3. Record audit trail in storage_cleanup_logs
    try {
      await supabaseAdmin.from('storage_cleanup_logs').insert({
        cleaned_count: targetOrders.length,
        order_codes: orderCodes,
        mode,
        executed_by: executedBy,
        details: {
          cleaned_at: nowIso,
          order_count: targetOrders.length,
          target_ids: orderIds,
        },
        created_at: nowIso,
      });
    } catch (logErr) {
      console.warn('Failed to insert storage cleanup log:', logErr);
    }

    return NextResponse.json({
      success: true,
      cleaned_count: targetOrders.length,
      order_codes: orderCodes,
      message: `Berhasil membersihkan ${targetOrders.length} foto bukti transfer yang telah melewati masa 90 hari.`,
    });
  } catch (err: any) {
    console.error('API Admin Cleanup Proofs POST error:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
