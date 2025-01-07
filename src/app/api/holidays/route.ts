import { NextResponse } from 'next/server';
import type { Holiday } from '@/lib/holiday';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month are required' },
        { status: 400 }
      );
    }

    const serviceKey = process.env.HOLIDAY_API_KEY;
    const url = `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo`;
    const params = new URLSearchParams({
      serviceKey: serviceKey!,
      solYear: year,
      solMonth: month.padStart(2, '0'),
      _type: 'json',
      numOfRows: '50',
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    // API 응답 구조에 따라 데이터 추출
    const items = data.response?.body?.items?.item;
    let holidays: Holiday[] = [];

    if (items) {
      holidays = Array.isArray(items) ? items : [items];
    }

    return NextResponse.json(holidays);
  } catch (error) {
    console.error('Failed to fetch holidays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holidays' },
      { status: 500 }
    );
  }
} 