import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  // 디버깅을 위한 로그 추가
  console.log('Request URL:', request.url);
  console.log('Cookies:', request.cookies.toString());
  console.log('Token:', token);

  // 로그인/회원가입 페이지는 통과
  if (request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // API 라우트 중 인증이 필요없는 경로는 통과
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    console.log('No token found, redirecting to login');
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    // 기존 토큰 삭제
    response.cookies.delete('token');
    return response;
  }

  try {
    // 토큰 검증
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback-secret'
    );
    const { payload } = await jose.jwtVerify(token, secret);
    
    if (!payload) {
      throw new Error('Invalid token');
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Token verification error:', error);
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/login|auth/signup|api/auth).*)',
  ],
}; 