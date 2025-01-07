'use client';

import { useState, useEffect } from 'react';
import { WorkRecord } from '@prisma/client';

export default function Stats() {
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalHours: 0,
    totalWage: 0,
    avgHoursPerDay: 0,
    weeklyHours: 0,
    nightShiftHours: 0,
    totalDays: 0
  });

  const calculateWorkHours = (startTime: Date, endTime: Date) => {
    return (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
  };

  const calculateNightShiftHours = (startTime: Date, endTime: Date) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    let nightHours = 0;

    // 밤 10시(22시)부터 다음날 오전 6시까지를 야간근무로 계산
    const nightStart = new Date(start);
    nightStart.setHours(22, 0, 0, 0);
    const nightEnd = new Date(start);
    nightEnd.setDate(nightEnd.getDate() + 1);
    nightEnd.setHours(6, 0, 0, 0);

    if (start < nightEnd && end > nightStart) {
      const overlapStart = Math.max(start.getTime(), nightStart.getTime());
      const overlapEnd = Math.min(end.getTime(), nightEnd.getTime());
      nightHours = (overlapEnd - overlapStart) / (1000 * 60 * 60);
    }

    return nightHours;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/work-records');
        if (response.ok) {
          const data: WorkRecord[] = await response.json();
          setWorkRecords(data);

          // 이번 달 기록만 필터링
          const now = new Date();
          const thisMonth = now.getMonth();
          const thisYear = now.getFullYear();
          
          const thisMonthRecords = data.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === thisMonth && 
                   recordDate.getFullYear() === thisYear;
          });

          // 통계 계산
          let totalHours = 0;
          let totalWage = 0;
          let nightShiftHours = 0;
          const weeklyHours: { [key: string]: number } = {};

          thisMonthRecords.forEach(record => {
            const hours = calculateWorkHours(record.startTime, record.endTime);
            totalHours += hours;
            totalWage += record.totalWage;
            nightShiftHours += calculateNightShiftHours(record.startTime, record.endTime);

            // 주간 근무시간 계산
            const date = new Date(record.date);
            const weekNum = `${date.getFullYear()}-${Math.floor(date.getDate() / 7)}`;
            weeklyHours[weekNum] = (weeklyHours[weekNum] || 0) + hours;
          });

          // 주간 평균 근무시간 계산
          const weeklyHoursAvg = Object.values(weeklyHours).reduce((sum, hours) => sum + hours, 0) / 
                                (Object.keys(weeklyHours).length || 1);

          setMonthlyStats({
            totalHours: Math.round(totalHours * 10) / 10,
            totalWage,
            avgHoursPerDay: Math.round((totalHours / thisMonthRecords.length) * 10) / 10,
            weeklyHours: Math.round(weeklyHoursAvg * 10) / 10,
            nightShiftHours: Math.round(nightShiftHours * 10) / 10,
            totalDays: thisMonthRecords.length
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-6">근무 통계</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold mb-4">이번 달 근무 현황</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">총 근무일수</span>
              <span className="font-medium">{monthlyStats.totalDays}일</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">총 근무시간</span>
              <span className="font-medium">{monthlyStats.totalHours}시간</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">일평균 근무시간</span>
              <span className="font-medium">{monthlyStats.avgHoursPerDay}시간</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">주간 평균 근무시간</span>
              <span className="font-medium">{monthlyStats.weeklyHours}시간</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">야간 근무시간</span>
              <span className="font-medium">{monthlyStats.nightShiftHours}시간</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold mb-4">급여 정보</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">이번 달 총 급여</span>
              <span className="font-medium text-blue-500">
                {monthlyStats.totalWage.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">시간당 평균 급여</span>
              <span className="font-medium">
                {monthlyStats.totalHours > 0 
                  ? Math.round(monthlyStats.totalWage / monthlyStats.totalHours).toLocaleString()
                  : 0}원
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 