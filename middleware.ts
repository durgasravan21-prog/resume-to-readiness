import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Execute Supabase SSR session validation and cookie refresh
  try {
    return await updateSession(request);
  } catch (err) {
    // Graceful fallback for local dev when session cookie is present
    const role = request.cookies.get('readiness_role')?.value;
    const { pathname } = request.nextUrl;

    if ((pathname.startsWith('/home') || pathname.startsWith('/analyses') || pathname.startsWith('/settings')) && !role) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname.startsWith('/tpc') && role !== 'coordinator' && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
