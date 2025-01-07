import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  console.log('Middleware token:', token);

  // JWT 검증 함수
  const verifyToken = async (token: string) => {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret'
      );
      const { payload } = await jose.jwtVerify(token, secret);
      return payload;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  };

  // 로그인/회원가입 페이지는 통과
  if (request.nextUrl.pathname.startsWith('/auth')) {
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      // 토큰이 유효하지 않으면 쿠키 삭제
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
    return NextResponse.next();
  }

  // API 라우트 중 인증이 필요없는 경로는 통과
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    console.log('No token found, redirecting to login');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 토큰 검증
  const decoded = await verifyToken(token);
  if (!decoded) {
    console.log('Invalid token, redirecting to login');
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 