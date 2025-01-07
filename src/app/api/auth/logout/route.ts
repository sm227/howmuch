import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  );

  // 토큰 쿠키 삭제
  response.cookies.delete('token');

  return response;
} 