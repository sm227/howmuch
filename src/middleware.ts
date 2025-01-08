import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 디버깅을 위한 로그 추가
  console.log('Middleware - Cookies:', request.cookies.getAll());
  console.log('Middleware - isLoggedIn:', request.cookies.get('isLoggedIn')?.value);
  console.log('Middleware - userId:', request.cookies.get('userId')?.value);

  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  const userId = request.cookies.get('userId')?.value;

  // 로그인/회원가입 페이지는 통과
  if (request.nextUrl.pathname.startsWith('/auth')) {
    // 이미 로그인된 상태면 홈으로 리다이렉트
    if (isLoggedIn && userId) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // API 라우트 중 인증이 필요없는 경로는 통과
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isLoggedIn || !userId) {
    console.log('Middleware - Redirecting to login page');
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    // 잘못된 쿠키 삭제
    response.cookies.delete('isLoggedIn');
    response.cookies.delete('userId');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/login|auth/signup|api/auth).*)',
  ],
}; 