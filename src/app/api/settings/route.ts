import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 사용자의 설정을 가져오거나, 없으면 생성
    let settings = await prisma.settings.findUnique({
      where: { userId: session },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: session,
          hourlyWage: 9860,  // 기본 시급
          autoBreakTime: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { hourlyWage, autoBreakTime } = body;

    // upsert를 사용하여 설정을 업데이트하거나 생성
    const settings = await prisma.settings.upsert({
      where: { userId: session },
      update: {
        hourlyWage,
        autoBreakTime,
      },
      create: {
        userId: session,
        hourlyWage,
        autoBreakTime,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 