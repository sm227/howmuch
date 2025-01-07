import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          hourlyWage: 9860,
          autoBreakTime: true,
          updatedAt: new Date(),
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
    const body = await request.json();
    const { hourlyWage, autoBreakTime } = body;

    let settings = await prisma.settings.findFirst();

    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: { 
          hourlyWage,
          autoBreakTime,
          updatedAt: new Date(),
        },
      });
    } else {
      settings = await prisma.settings.create({
        data: { 
          hourlyWage,
          autoBreakTime,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 