import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'Sesi tidak ditemukan' },
        { status: 401 }
      );
    }

    const isValid = await verifySessionToken(token);

    if (!isValid) {
      return NextResponse.json(
        { authenticated: false, error: 'Sesi kedaluwarsa atau tidak valid' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        username: process.env.ADMIN_USERNAME || 'admin',
        role: 'admin',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { authenticated: false, error: 'Gagal memverifikasi sesi' },
      { status: 500 }
    );
  }
}
