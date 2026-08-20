import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

  try {
    // 0. Check if user is in BloxyLucy blacklist table
    try {
      const { data: blData } = await supabase
        .from('blacklists')
        .select('roblox_username, reason')
        .ilike('roblox_username', username)
        .maybeSingle();

      if (blData) {
        return NextResponse.json({
          success: false,
          isBlacklisted: true,
          message: `Akun Roblox "${username}" telah di-blacklist oleh BloxyLucy (${blData.reason || 'Pelanggaran'}). Pesanan tidak dapat dilanjutkan.`,
        });
      }
    } catch (err) {
      console.warn('Blacklist table query notice:', err);
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
      cache: 'no-store',
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

    // Check exact username in blacklist too
    try {
      const { data: blDataExact } = await supabase
        .from('blacklists')
        .select('roblox_username, reason')
        .ilike('roblox_username', exactUsername)
        .maybeSingle();

      if (blDataExact) {
        return NextResponse.json({
          success: false,
          isBlacklisted: true,
          message: `Akun Roblox "${exactUsername}" telah di-blacklist oleh BloxyLucy (${blDataExact.reason || 'Pelanggaran'}). Pesanan tidak dapat dilanjutkan.`,
        });
      }

      // Check resolved Roblox User ID in blacklist too
      if (userId) {
        const { data: blDataId } = await supabase
          .from('blacklists')
          .select('roblox_username, reason')
          .eq('roblox_user_id', String(userId))
          .maybeSingle();

        if (blDataId) {
          return NextResponse.json({
            success: false,
            isBlacklisted: true,
            message: `Akun Roblox dengan ID ${userId} ("${exactUsername}") telah di-blacklist oleh BloxyLucy (${blDataId.reason || 'Pelanggaran'}). Pesanan tidak dapat dilanjutkan.`,
          });
        }
      }
    } catch {
      // Continue
    }

    // 2. Fetch Avatar Headshot Thumbnail
    let avatarUrl = '';
    try {
      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`,
        { cache: 'no-store' }
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

    return NextResponse.json({
      success: true,
      userId,
      username: exactUsername,
      displayName,
      avatarUrl,
    });
  } catch (error) {
    console.error('Roblox check API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi gangguan saat mengecek akun Roblox',
    });
  }
}
