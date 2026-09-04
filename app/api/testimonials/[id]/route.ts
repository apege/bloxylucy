import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { invalidateMemoryCache } from '@/lib/server-cache';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      username,
      message,
      comment,
      rating,
      image_path,
      proofImage,
      order_code,
      status,
      is_active,
      adminReply,
      admin_reply,
    } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined || username !== undefined) {
      updates.name = String(name || username).trim();
    }

    if (message !== undefined || comment !== undefined) {
      updates.message = String(message || comment).trim();
    }

    if (rating !== undefined) {
      updates.rating = Math.min(5, Math.max(1, Number(rating) || 5));
    }

    if (image_path !== undefined || proofImage !== undefined) {
      updates.image_path = image_path !== undefined ? image_path : proofImage;
    }

    if (order_code !== undefined) {
      updates.order_code = order_code ? String(order_code).trim() : null;
    }

    if (status !== undefined) {
      updates.status = status;
    } else if (is_active !== undefined) {
      updates.status = is_active ? 'approved' : 'rejected';
    }

    if (admin_reply !== undefined || adminReply !== undefined) {
      updates.admin_reply = admin_reply !== undefined ? admin_reply : adminReply;
    }

    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase testimonial update error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    invalidateMemoryCache('testimonials_');

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        order_code: data.order_code || '',
        username: data.name,
        comment: data.message,
        rating: data.rating,
        proofImage: data.image_path,
        adminReply: data.admin_reply,
        is_active: data.status === 'approved',
        avatarLetter: (data.name || 'U')[0].toUpperCase(),
        timeAgo: 'Baru saja',
        created_at: data.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase testimonial delete error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    invalidateMemoryCache('testimonials_');

    return NextResponse.json({ success: true, message: 'Testimoni berhasil dihapus' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
