import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const isLoggedIn = cookieStore.get('isLoggedIn')?.value === 'true';
    const userId = cookieStore.get('userId')?.value;

    if (!isLoggedIn || !userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { date, startTime, endTime, breakTime, wage, totalWage } = body;

    // 날짜와 시간을 로컬 시간으로 처리
    const workDate = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startDateTime = new Date(workDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(workDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    
    // 종료시간이 시작시간보다 이전인 경우 다음날로 설정
    if (endDateTime < startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    const workRecord = await prisma.workRecord.create({
      data: {
        userId,
        date: workDate,
        startTime: startDateTime,
        endTime: endDateTime,
        breakTime,
        wage: wage || 9860,
        totalWage: totalWage || 0,
      },
    });

    return NextResponse.json(workRecord);
  } catch (error) {
    console.error('Failed to create work record:', error);
    return NextResponse.json(
      { error: 'Failed to create work record' },
      { status: 500 }
    );
  }
}

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

    const workRecords = await prisma.workRecord.findMany({
      where: { userId: session },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(workRecords);
  } catch (error) {
    console.error('Failed to fetch work records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work records' },
      { status: 500 }
    );
  }
} 