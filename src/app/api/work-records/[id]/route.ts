import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const workRecord = await prisma.workRecord.update({
      where: { id: parseInt(id) },
      data: {
        ...body,
        date: new Date(body.date),
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
      },
    });
    
    return NextResponse.json(workRecord);
  } catch (error) {
    console.error('Failed to update work record:', error);
    return NextResponse.json(
      { error: '업데이트 실패' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const id = parseInt(params.id);
    await prisma.workRecord.delete({
      where: { 
        id,
        userId // 자신의 기록만 삭제할 수 있도록
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete work record:', error);
    return NextResponse.json(
      { error: 'Failed to delete work record' },
      { status: 500 }
    );
  }
} 