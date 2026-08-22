import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { invalidateMemoryCache } from '@/lib/server-cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updatePayload.name = String(body.name).trim();
    if (body.robux !== undefined) updatePayload.robux = Math.max(1, Number(body.robux));
    if (body.price !== undefined) updatePayload.price = Math.max(0, Number(body.price));
    if (body.is_active !== undefined) updatePayload.is_active = Boolean(body.is_active);
    if (body.original_price !== undefined) updatePayload.original_price = body.original_price ? Number(body.original_price) : null;
    if (body.is_popular !== undefined) updatePayload.is_popular = Boolean(body.is_popular);
    if (body.is_best_value !== undefined) updatePayload.is_best_value = Boolean(body.is_best_value);
    if (body.is_promo !== undefined) updatePayload.is_promo = Boolean(body.is_promo);
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.image_path !== undefined) updatePayload.image_path = body.image_path;

    let { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    // Resilient fallback if custom columns do not exist in DB yet
    if (error) {
      const coreUpdatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (body.name !== undefined) coreUpdatePayload.name = String(body.name).trim();
      if (body.robux !== undefined) coreUpdatePayload.robux = Math.max(1, Number(body.robux));
      if (body.price !== undefined) coreUpdatePayload.price = Math.max(0, Number(body.price));
      if (body.is_active !== undefined) coreUpdatePayload.is_active = Boolean(body.is_active);

      const retry = await supabase
        .from('products')
        .update(coreUpdatePayload)
        .eq('id', id)
        .select()
        .single();

      if (retry.error) {
        console.error('Supabase Update Product error:', retry.error);
        return NextResponse.json({ success: false, error: retry.error.message }, { status: 500 });
      }

      data = retry.data;
    }

    invalidateMemoryCache('products_');
    return NextResponse.json({ success: true, data });
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
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Delete Product error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    invalidateMemoryCache('products_');
    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
