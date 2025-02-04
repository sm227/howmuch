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

    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

    // 단순한 세션 쿠키 설정
    response.cookies.set('session', user.id, {
      path: '/',
      sameSite: 'lax',
      secure: false, // HTTPS가 없어도 동작하도록
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7일
    });

    return response;

  } catch (error) {
    console.error('로그인 실패:', error);
    return NextResponse.json(
      { error: '로그인에 실패했습니다.' },
      { status: 500 }
    );
  }
} 