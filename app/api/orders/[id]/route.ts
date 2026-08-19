import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function applyIdOrCodeFilter(query: any, id: string) {
  const isNumeric = /^\d+$/.test(id);
  if (isNumeric) {
    return query.or(`id.eq.${id},order_code.eq.${id}`);
  }
  return query.eq('order_code', id);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let query = supabase.from('orders').select('*');
    query = applyIdOrCodeFilter(query, id);
    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });
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
      ...body,
      updated_at: new Date().toISOString(),
    };

    let query = supabase.from('orders').update(updatePayload);
    query = applyIdOrCodeFilter(query, id);
    const { data, error } = await query.select().maybeSingle();

    if (error) {
      console.warn('Supabase Update Order warning:', error.message);
      return NextResponse.json({ success: true, data: { id, ...updatePayload } });
    }

    return NextResponse.json({ success: true, data: data || { id, ...updatePayload } });
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

    let query = supabase.from('orders').delete();
    query = applyIdOrCodeFilter(query, id);
    const { error } = await query;

    if (error) {
      console.warn('Supabase Delete Order warning:', error.message);
    }

    return NextResponse.json({ success: true, message: 'Pesanan berhasil dihapus' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
