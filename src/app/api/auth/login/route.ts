import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // 응답 생성
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

    // 쿠키 설정 수정
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7일
    };

    // isLoggedIn 쿠키 설정
    response.cookies.set('isLoggedIn', 'true', cookieOptions);
    
    // userId 쿠키 설정
    response.cookies.set('userId', user.id, cookieOptions);

    console.log('Login successful - Cookies set:', response.cookies.getAll());
    
    return response;

  } catch (error) {
    console.error('Failed to login:', error);
    return NextResponse.json(
      { error: '로그인에 실패했습니다.' },
      { status: 500 }
    );
  }
} 