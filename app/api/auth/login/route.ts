import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'bloxylucy2026';

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    // Verify credentials (case-insensitive username, exact password)
    if (
      username.trim().toLowerCase() !== validUsername.toLowerCase() ||
      password !== validPassword
    ) {
      return NextResponse.json(
        { success: false, error: 'Username atau password admin salah!' },
        { status: 401 }
      );
    }

    // Generate signed session token
    const token = await createSessionToken(validUsername);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: {
        username: validUsername,
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
