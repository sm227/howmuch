'use client';

import { useState, useEffect } from 'react';
import { WorkRecord } from '@prisma/client';
import { Holiday, isHoliday } from '@/lib/holiday';

interface CalendarProps {
  onDateSelect: (date: Date, record?: WorkRecord) => void;
  workRecords?: WorkRecord[];
  holidays?: Holiday[];
}

export default function Calendar({ onDateSelect, workRecords = [], holidays = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  // 해당 날짜의 근무 기록을 가져오는 함수
  const getWorkRecord = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return workRecords.find(record => {
      const recordDate = new Date(record.date);
      return recordDate.getDate() === date.getDate() &&
             recordDate.getMonth() === date.getMonth() &&
             recordDate.getFullYear() === date.getFullYear();
    });
  };

  // 시간 포맷팅 함수
  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [];
  let week = Array(7).fill(null);

  days.forEach((day, index) => {
    const weekDay = (firstDayOfMonth + index) % 7;
    week[weekDay] = day;
    
    if (weekDay === 6 || index === days.length - 1) {
      weeks.push([...week]);
      week = Array(7).fill(null);
    }
  });

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
          >
            →
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="text-center text-sm font-medium py-2">
            {day}
          </div>
        ))}
        {weeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => {
            const workRecord = day ? getWorkRecord(day) : null;
            const date = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
            const isHolidayDate = date ? isHoliday(date, holidays) : false;
            
            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`
                  p-1 min-h-[80px] flex flex-col relative
                  ${day ? 'hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer' : ''}
                  ${isHolidayDate ? 'text-red-500' : ''}
                  ${day === new Date().getDate() &&
                    currentDate.getMonth() === new Date().getMonth() &&
                    currentDate.getFullYear() === new Date().getFullYear()
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : ''}
                  ${workRecord ? 'border border-blue-200 dark:border-blue-800' : ''}
                `}
                onClick={() => day && onDateSelect(
                  new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
                  workRecord || undefined
                )}
              >
                <span className="text-sm mb-1">{day}</span>
                {workRecord && (
                  <div className="text-[10px] space-y-0.5">
                    <div className="text-blue-600 dark:text-blue-400">
                      {formatTime(new Date(workRecord.startTime))} ~ 
                      {formatTime(new Date(workRecord.endTime))}
                    </div>
                    <div className="text-green-600 dark:text-green-400">
                      {workRecord.totalWage.toLocaleString()}원
                      {isHolidayDate && ' (휴일)'}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
} 