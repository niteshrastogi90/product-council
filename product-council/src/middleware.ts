import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const isProtectedPage = req.nextUrl.pathname.startsWith('/council') ||
    req.nextUrl.pathname.startsWith('/history');
  const isProtectedApi = req.nextUrl.pathname.startsWith('/api/council') ||
    req.nextUrl.pathname.startsWith('/api/sessions');

  if (!isLoggedIn && isProtectedPage) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (!isLoggedIn && isProtectedApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/council/:path*', '/history/:path*', '/api/council/:path*', '/api/sessions/:path*'],
};
