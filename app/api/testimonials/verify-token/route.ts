import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token')?.trim();

    if (!token) {
      return NextResponse.json({
        valid: false,
        message: 'Token ulasan tidak ditemukan.',
      });
    }

    // 1. Check if an order matches this token (token can be order_code or review token)
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .or(`order_code.eq.${token},id.eq.${isNaN(Number(token)) ? 0 : Number(token)}`)
      .single();

    if (error || !order) {
      // Also check mock orders if supabase is empty
      const isSampleOrder = ['BLX25051801', 'BLX25051802', 'BLX25051803', 'BLX25051804', 'BLX25051805'].includes(token);
      if (isSampleOrder) {
        return NextResponse.json({
          valid: true,
          order: {
            order_code: token,
            roblox_username: 'BloxyMember',
            robux: 2200,
            order_status: 'completed',
          },
        });
      }

      return NextResponse.json({
        valid: false,
        message: 'Token ulasan tidak valid atau pesanan tidak ditemukan.',
      });
    }

    // Only completed orders can review
    if (order.order_status !== 'completed') {
      return NextResponse.json({
        valid: false,
        message: 'Pesanan belum selesai diproses. Ulasan hanya bisa diberikan setelah pesanan berstatus Selesai.',
      });
    }

    // 2. Check if this order code already submitted a testimonial
    const { data: existingReview } = await supabase
      .from('testimonials')
      .select('id')
      .eq('order_code', order.order_code)
      .single();

    if (existingReview) {
      return NextResponse.json({
        valid: false,
        already_reviewed: true,
        message: 'Anda sudah pernah memberikan ulasan untuk pesanan ini. Terima kasih!',
      });
    }

    return NextResponse.json({
      valid: true,
      order: {
        order_code: order.order_code,
        roblox_username: order.roblox_username,
        robux: order.robux,
        order_status: order.order_status,
      },
    });
  } catch (err: any) {
    console.error('Verify review token error:', err);
    return NextResponse.json({ valid: false, message: 'Gagal memverifikasi token' }, { status: 500 });
  }
}
