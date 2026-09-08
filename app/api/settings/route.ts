import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { StoreSettings } from '@/lib/admin-types';
import { getMemoryCache, setMemoryCache, invalidateMemoryCache } from '@/lib/server-cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'BloxyLucy Top Up Robux',
  whatsapp_number: '6285828378025',
  qris_image_path: '/images/qris.webp',
  logo_image_path: '/images/logo.jpeg',
  banner_image_path: '',
  promo_active: true,
  promo_tag: 'PROMO SPESIAL BULAN INI',
  promo_badge: 'LIMITED STOCK',
  promo_title: 'ROBUX BULAN INI',
  promo_subtitle: 'Top Up Robux Instant, Cepat, Legal, Aman & Bergaransi 100% Uang Kembali!',
  promo_robux_amount: 2200,
  promo_original_label: '2.000 Robux',
  promo_discount_price: 45000,
  promo_end_date: '2026-09-30T23:59:59.000Z',
};

export async function GET(req: NextRequest) {
  try {
    const cached = getMemoryCache<StoreSettings>('store_settings', 300000);
    if (cached) {
      return NextResponse.json(
        { success: true, data: cached },
        {
          headers: {
            'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
          },
        }
      );
    }

    const { data, error } = await supabase.from('store_settings').select('*').limit(1).maybeSingle();

    if (error || !data) {
      return NextResponse.json({ success: true, data: DEFAULT_SETTINGS });
    }

    const mergedSettings: StoreSettings = {
      ...DEFAULT_SETTINGS,
      ...data,
      banner_image_path:
        data.banner_image_path && data.banner_image_path !== '/images/pricelist.jpeg'
          ? data.banner_image_path
          : '',
      promo_active: data.promo_active !== undefined ? Boolean(data.promo_active) : true,
    };

    setMemoryCache('store_settings', mergedSettings);

    return NextResponse.json(
      { success: true, data: mergedSettings },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
        },
      }
    );
  } catch (err: any) {
    console.error('API Settings GET Error:', err);
    return NextResponse.json({ success: true, data: DEFAULT_SETTINGS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, created_at, ...cleanBody } = body;

    const payload = {
      ...cleanBody,
      promo_active: body.promo_active !== undefined ? Boolean(body.promo_active) : true,
      updated_at: new Date().toISOString(),
    };

    // Check if a row already exists
    const { data: existing } = await supabase
      .from('store_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    let resultData = payload;
    let resultError = null;

    if (existing && existing.id) {
      const { data, error } = await supabase
        .from('store_settings')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      resultData = data || payload;
      resultError = error;
    } else {
      const { data, error } = await supabase
        .from('store_settings')
        .insert(payload)
        .select()
        .single();
      resultData = data || payload;
      resultError = error;
    }

    if (resultError) {
      console.warn('Supabase store_settings save warning:', resultError.message);
    }

    invalidateMemoryCache('store_settings');

    return NextResponse.json({ success: true, data: resultData });
  } catch (err: any) {
    console.error('API Settings POST Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
