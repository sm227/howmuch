import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // 세션 쿠키만 삭제
  response.cookies.delete('session');
  
  return response;
} 