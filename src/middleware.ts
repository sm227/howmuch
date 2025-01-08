import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');

  // 로그인, 회원가입 페이지는 통과
  if (request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // API 요청은 통과
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 세션이 없으면 로그인 페이지로
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 