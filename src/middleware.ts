import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('Middleware - Request URL:', request.url);
  console.log('Middleware - Cookies:', request.cookies.getAll());

  // auth 관련 페이지는 체크하지 않음
  if (request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // API 경로는 체크하지 않음
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  const userId = request.cookies.get('userId')?.value;

  if (!isLoggedIn || !userId) {
    console.log('Middleware - Not logged in, redirecting to login page');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 