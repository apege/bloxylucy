import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { RETENTION_DAYS } from '@/lib/storage-retention';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleCronCleanup(req);
}

export async function POST(req: NextRequest) {
  return handleCronCleanup(req);
}

async function handleCronCleanup(req: NextRequest) {
  try {
    // Optional secret key verification if CRON_SECRET is set in environment
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized cron request.' }, { status: 401 });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Fetch orders that have proof
    const { data: expiredOrders, error: findError } = await supabaseAdmin
      .from('orders')
      .select('id, order_code, payment_proof_path, created_at, expires_at')
      .not('payment_proof_path', 'is', null);

    if (findError) {
      console.error('Cron cleanup find error:', findError);
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
        message: 'Tidak ada bukti transfer yang kedaluwarsa (> 90 hari).',
        timestamp: nowIso,
      });
    }

    const orderIds = targetOrders.map((o) => o.id);
    const orderCodes = targetOrders.map((o) => o.order_code);

    // 2. Safe cleanup: ONLY set payment_proof_path = NULL. Retain all transaction data.
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_proof_path: null,
        updated_at: nowIso,
      })
      .in('id', orderIds);

    if (updateError) {
      console.error('Cron cleanup update error:', updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // 3. Insert audit log
    try {
      await supabaseAdmin.from('storage_cleanup_logs').insert({
        cleaned_count: targetOrders.length,
        order_codes: orderCodes,
        mode: 'cron',
        executed_by: 'system_cron',
        details: {
          cleaned_at: nowIso,
          order_count: targetOrders.length,
          target_ids: orderIds,
        },
        created_at: nowIso,
      });
    } catch (logErr) {
      console.warn('Failed to insert storage cleanup log during cron:', logErr);
    }

    return NextResponse.json({
      success: true,
      cleaned_count: targetOrders.length,
      order_codes: orderCodes,
      message: `Cron auto-cleanup berhasil membersihkan ${targetOrders.length} foto bukti transfer (> 90 hari).`,
      timestamp: nowIso,
    });
  } catch (err: any) {
    console.error('Cron Cleanup Error:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
