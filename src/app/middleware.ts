import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/auth';

export function middleware(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (
      request.url.includes('/api/admin') &&
      typeof decoded === 'object' &&
      decoded !== null &&
      'role' in decoded &&
      (decoded as any).role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/appointments/:path*', '/api/services/:path*', '/api/schedules/:path*', '/api/slider-images/:path*', '/api/admin/:path*'],
};