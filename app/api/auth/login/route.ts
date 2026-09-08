import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const envUser = process.env.ADMIN_USERNAME;
    const envPass = process.env.ADMIN_PASSWORD;

    // Check against configured ENV or predefined valid admin pairs
    const isValidLogin =
      (envUser && envPass && username.trim().toLowerCase() === envUser.toLowerCase() && password === envPass) ||
      (username.trim().toLowerCase() === 'admin_bloxylucy' && password === '@Bloxylucy2026') ||
      (username.trim().toLowerCase() === 'admin' && password === 'bloxylucy2026');

    if (!isValidLogin) {
      return NextResponse.json(
        { success: false, error: 'Username atau password admin salah!' },
        { status: 401 }
      );
    }

    const activeAdminUsername = envUser || username.trim();

    // Generate signed session token
    const token = await createSessionToken(activeAdminUsername);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: {
        username: activeAdminUsername,
        role: 'admin',
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('API Auth Login Error:', err);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem saat login.' },
      { status: 500 }
    );
  }
}
