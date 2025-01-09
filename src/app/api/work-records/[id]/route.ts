import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = context.params;
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

    // 먼저 해당 기록이 존재하고 사용자의 것인지 확인
    const existingRecord = await prisma.workRecord.findFirst({
      where: {
        id: id,
        userId: session
      }
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: '수정 권한이 없거나 존재하지 않는 기록입니다.' },
        { status: 403 }
      );
    }
    
    const workRecord = await prisma.workRecord.update({
      where: { 
        id: id,
        userId: session
      },
      data: {
        date: workDate,
        startTime: startDateTime,
        endTime: endDateTime,
        breakTime,
        wage,
        totalWage,
      },
    });
    
    return NextResponse.json(workRecord);
  } catch (error) {
    console.error('Failed to update work record:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: '업데이트 실패' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const { id } = context.params;
    await prisma.workRecord.delete({
      where: { 
        id: id,
        userId: session
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete work record:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: '삭제 실패' },
      { status: 500 }
    );
  }
} 