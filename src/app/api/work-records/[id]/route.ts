import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { date, startTime, endTime, breakTime, wage, totalWage } = body;

    const workDate = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startDateTime = new Date(workDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(workDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    
    if (endDateTime < startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    const workRecord = await prisma.workRecord.update({
      where: { id },
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
    console.error('Failed to update work record:', error);
    return NextResponse.json(
      { error: 'Failed to update work record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.workRecord.delete({
      where: { id },
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