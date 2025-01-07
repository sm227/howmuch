import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('Login attempt for email:', email);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('User not found with email:', email);
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isValid);

    if (!isValid) {
      console.log('Invalid password for user:', email);
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    console.log('Login successful for user:', email);

    // JWT 토큰 생성
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback-secret'
    );
    const token = await new jose.SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    // 응답 생성
    const response = new NextResponse(
      JSON.stringify({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // 쿠키 직접 설정
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    console.log('Cookie has been set with token:', token.substring(0, 20) + '...');
    return response;

  } catch (error) {
    console.error('Failed to login:', error);
    return NextResponse.json(
      { error: '로그인에 실패했습니다.' },
      { status: 500 }
    );
  }
} 