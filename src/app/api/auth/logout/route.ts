import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  );

  // 로그인 관련 쿠키 모두 삭제
  response.cookies.delete('isLoggedIn');
  response.cookies.delete('userId');

  return response;
} 