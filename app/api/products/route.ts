import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/admin-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = supabase.from('products').select('*').order('robux', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase get products error:', error.message);
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    console.error('API Products GET Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      robux,
      price,
      original_price,
      is_active = true,
      is_popular = false,
      is_best_value = false,
      is_promo = false,
      category = 'Robux',
      image_path = null,
    } = body;

    if (!robux || !price) {
      return NextResponse.json(
        { success: false, error: 'Jumlah Robux dan harga wajib diisi.' },
        { status: 400 }
      );
    }

    const robuxNum = Math.max(1, Number(robux));
    const priceNum = Math.max(0, Number(price));
    const productName = name ? String(name).trim() : `${new Intl.NumberFormat('id-ID').format(robuxNum)} Robux`;

    // Try full payload with all columns
    const fullPayload: Record<string, any> = {
      name: productName,
      robux: robuxNum,
      price: priceNum,
      is_active: Boolean(is_active),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (original_price) fullPayload.original_price = Number(original_price);
    if (is_popular !== undefined) fullPayload.is_popular = Boolean(is_popular);
    if (is_best_value !== undefined) fullPayload.is_best_value = Boolean(is_best_value);
    if (is_promo !== undefined) fullPayload.is_promo = Boolean(is_promo);
    if (category) fullPayload.category = category;
    if (image_path) fullPayload.image_path = image_path;

    let { data, error } = await supabase
      .from('products')
      .insert(fullPayload)
      .select()
      .single();

    // Resilient fallback if custom columns (category, is_popular, etc.) do not exist in DB yet
    if (error) {
      const corePayload = {
        name: productName,
        robux: robuxNum,
        price: priceNum,
        is_active: Boolean(is_active),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const retry = await supabase
        .from('products')
        .insert(corePayload)
        .select()
        .single();

      if (retry.error) {
        console.error('Supabase Insert Product error:', retry.error);
        return NextResponse.json({ success: false, error: retry.error.message }, { status: 500 });
      }

      data = retry.data;
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error('API Products POST Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
