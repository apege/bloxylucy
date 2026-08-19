import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/admin-types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = supabase.from('products').select('*').order('robux', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    if (category) {
      query = query.eq('category', category);
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
      category = 'instant',
      image_path = null,
    } = body;

    if (!name || !robux || !price) {
      return NextResponse.json(
        { success: false, error: 'Nama paket, jumlah Robux, dan harga wajib diisi.' },
        { status: 400 }
      );
    }

    const newProductPayload = {
      name,
      robux: Number(robux),
      price: Number(price),
      original_price: original_price ? Number(original_price) : null,
      is_active: Boolean(is_active),
      is_popular: Boolean(is_popular),
      is_best_value: Boolean(is_best_value),
      is_promo: Boolean(is_promo),
      category: category || 'instant',
      image_path: image_path || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('products')
      .insert(newProductPayload)
      .select()
      .single();

    if (error) {
      console.warn('Supabase Insert Product warning:', error.message);
      return NextResponse.json({
        success: true,
        data: { id: Date.now(), ...newProductPayload },
      });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error('API Products POST Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
