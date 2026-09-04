import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Testimonial } from '@/lib/admin-types';
import { getMemoryCache, setMemoryCache, invalidateMemoryCache } from '@/lib/server-cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active_only') === 'true';
    const cacheKey = `testimonials_${activeOnly ? 'active' : 'all'}`;

    // 1. Return from in-memory cache if fresh (TTL: 60s)
    const cached = getMemoryCache<Testimonial[]>(cacheKey, 60000);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return NextResponse.json(
        { success: true, data: cached },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        }
      );
    }

    let query = supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('status', 'approved').limit(50);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.warn('Supabase get testimonials warning:', error?.message);
      return NextResponse.json({ success: true, data: [] });
    }

    // Collect all order_codes so we can fetch their robux amounts in one query
    const orderCodes = data
      .map((d: any) => d.order_code)
      .filter(Boolean) as string[];

    let orderRobuxMap: Record<string, number> = {};
    if (orderCodes.length > 0) {
      const { data: orders } = await supabase
        .from('orders')
        .select('order_code, robux')
        .in('order_code', orderCodes);
      if (orders) {
        for (const o of orders) {
          orderRobuxMap[o.order_code] = o.robux;
        }
      }
    }

    let items: Testimonial[] = data.map((d: any) => {
      const dbRobux = d.order_code ? orderRobuxMap[d.order_code] : null;
      let finalRobuxPackage: string | undefined = undefined;

      if (dbRobux) {
        finalRobuxPackage = `${new Intl.NumberFormat('id-ID').format(dbRobux)} Robux`;
      } else if (d.order_code) {
        const codeStr = String(d.order_code).trim();
        if (codeStr.toLowerCase().includes('robux')) {
          finalRobuxPackage = codeStr;
        } else if (/^\d+$/.test(codeStr.replace(/\./g, ''))) {
          const num = Number(codeStr.replace(/\./g, ''));
          if (num > 0) {
            finalRobuxPackage = `${new Intl.NumberFormat('id-ID').format(num)} Robux`;
          }
        }
      }

      return {
        id: d.id,
        order_code: d.order_code || '',
        username: d.name || 'Pembeli',
        rating: d.rating || 5,
        robuxPackage: finalRobuxPackage,
        comment: d.message || '',
        timeAgo: 'Baru saja',
        avatarLetter: (d.name || 'U')[0].toUpperCase(),
        hasProof: Boolean(d.image_path),
        proofImage: d.image_path || null,
        proofAmount: finalRobuxPackage,
        adminReply: d.admin_reply || null,
        is_active: d.status === 'approved',
        created_at: d.created_at || new Date().toISOString(),
      };
    });

    if (activeOnly) {
      items = items.filter((t) => t.is_active);
    }

    setMemoryCache(cacheKey, items);

    return NextResponse.json(
      { success: true, data: items },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err: any) {
    console.error('API Testimonials GET Error:', err);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      token,
      rating,
      comment,
      message,
      name,
      username,
      proofImage,
      image_path,
      order_code,
      admin_reply,
      status,
      is_admin_create,
    } = body;

    // Case 1: Admin manual creation / CRUD from Admin Panel
    if (is_admin_create || (!token && (name || username) && (comment || message))) {
      const finalName = String(name || username || 'Member BloxyLucy').trim();
      const finalMsg = String(message || comment || '').trim();
      const finalRating = Math.min(5, Math.max(1, Number(rating) || 5));
      const finalStatus = status === 'rejected' || status === 'pending' ? status : 'approved';
      const finalProof = image_path || proofImage || null;

      if (!finalName || !finalMsg) {
        return NextResponse.json(
          { success: false, error: 'Nama/Username dan Isi Ulasan wajib diisi.' },
          { status: 400 }
        );
      }

      const insertPayload = {
        name: finalName,
        message: finalMsg,
        rating: finalRating,
        status: finalStatus,
        image_path: finalProof,
        order_code: order_code ? String(order_code).trim() : null,
        admin_reply: admin_reply || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('testimonials')
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert testimonial error:', error);
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
      }, { status: 201 });
    }

    // Case 2: Customer submission via review token
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token review pembeli diperlukan untuk mengirim ulasan.' },
        { status: 400 }
      );
    }

    if (!comment || !rating) {
      return NextResponse.json(
        { success: false, error: 'Rating dan ulasan komentar wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanToken = token.trim();
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('order_code', cleanToken)
      .maybeSingle();

    let verifiedUsername = username || 'Pembeli';
    if (order) {
      verifiedUsername = order.roblox_username;
    }

    const newTestimonialPayload = {
      name: verifiedUsername,
      message: comment.trim(),
      rating: Math.min(5, Math.max(1, Number(rating))),
      status: 'approved',
      image_path: proofImage || image_path || null,
      order_code: cleanToken,
      admin_reply: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('testimonials')
      .insert(newTestimonialPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert customer testimonial error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    invalidateMemoryCache('testimonials_');

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        order_code: data.order_code,
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
    }, { status: 201 });
  } catch (err: any) {
    console.error('API Testimonials POST Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
