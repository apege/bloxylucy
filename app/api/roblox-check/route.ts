import { NextRequest, NextResponse } from 'next/server';

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
