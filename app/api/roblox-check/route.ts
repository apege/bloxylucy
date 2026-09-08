import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMemoryCache, setMemoryCache } from '@/lib/server-cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim();

  if (!username) {
    return NextResponse.json(
      { success: false, message: 'Username tidak boleh kosong' },
      { status: 400 }
    );
  }

  const cacheKey = `roblox_user_${username.toLowerCase()}`;
  const cachedUser = getMemoryCache<any>(cacheKey, 300000); // 5 minutes cache
  if (cachedUser) {
    return NextResponse.json(cachedUser, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      },
    });
  }

  try {
    // 0. Check if user is in BloxyLucy blacklist table (Single query)
    try {
      const { data: blData } = await supabase
        .from('blacklists')
        .select('roblox_username, roblox_user_id, reason')
        .ilike('roblox_username', username)
        .limit(1)
        .maybeSingle();

      if (blData) {
        return NextResponse.json({
          success: false,
          isBlacklisted: true,
          message: `Akun Roblox "${username}" telah di-blacklist oleh BloxyLucy (${blData.reason || 'Pelanggaran'}). Pesanan tidak dapat dilanjutkan.`,
        });
      }
    } catch {
      // Continue if table doesn't exist
    }

    // 1. Get Roblox User ID from Username
    const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false,
      }),
      next: { revalidate: 300 },
    });

    if (!userRes.ok) {
      return NextResponse.json({
        success: false,
        message: 'Gagal menghubungi server Roblox',
      });
    }

    const userData = await userRes.json();

    if (!userData.data || userData.data.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Username Roblox "${username}" tidak ditemukan`,
      });
    }

    const user = userData.data[0];
    const userId = user.id;
    const exactUsername = user.name;
    const displayName = user.displayName;

    // 2. Fetch Avatar Headshot Thumbnail
    let avatarUrl = '';
    try {
      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`,
        { next: { revalidate: 3600 } }
      );
      if (thumbRes.ok) {
        const thumbData = await thumbRes.json();
        if (thumbData.data && thumbData.data.length > 0) {
          avatarUrl = thumbData.data[0].imageUrl || '';
        }
      }
    } catch {
      // Ignore thumbnail error and continue
    }

    const result = {
      success: true,
      userId,
      username: exactUsername,
      displayName,
      avatarUrl,
    };

    setMemoryCache(cacheKey, result);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Terjadi gangguan saat mengecek akun Roblox',
    });
  }
}
