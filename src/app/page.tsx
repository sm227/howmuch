'use client';

import { useState, useEffect } from 'react';
import WorkRegisterModal from '@/components/WorkRegisterModal';
import WageSettings from '@/components/WageSettings';
import UserProfile from '@/components/UserProfile';
import { WorkRecord } from '@prisma/client';
import { calculateDeductions } from '@/lib/wage';

interface User {
  id: string;
  name: string | null;
  email: string;
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [monthlyWage, setMonthlyWage] = useState(0);
  const [nextWorkDate, setNextWorkDate] = useState<Date | null>(null);
  const [nextWorkRecord, setNextWorkRecord] = useState<WorkRecord | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [monthlyDeductions, setMonthlyDeductions] = useState({
    totalWage: 0,
    tax: 0,
    insurance: 0,
    netWage: 0,
  });

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  // 근무 기록 가져오기
  const fetchWorkRecords = async () => {
    try {
      const response = await fetch('/api/work-records');
      if (response.ok) {
        const data = await response.json();
        setWorkRecords(data);
        
        // 이번달 총급여 계산
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        const thisMonthRecords = data.filter((record: WorkRecord) => {
          const recordDate = new Date(record.date);
          return recordDate.getMonth() === thisMonth && 
                 recordDate.getFullYear() === thisYear;
        });
        
        const total = thisMonthRecords.reduce((sum: number, record: WorkRecord) => {
          return sum + record.totalWage;
        }, 0);
        
        // 공제 계산
        const deductions = calculateDeductions(total);
        setMonthlyDeductions(deductions);
        setMonthlyWage(total);

        // 다음 출근일 찾기
        const futureRecords = data
          .map(record => ({
            ...record,
            date: new Date(record.date)
          }))
          .filter(record => record.date > now)
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        if (futureRecords.length > 0) {
          setNextWorkDate(futureRecords[0].date);
          setNextWorkRecord(futureRecords[0]);
        } else {
          setNextWorkDate(null);
          setNextWorkRecord(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch work records:', error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchWorkRecords();
  }, []);

  // 최근 근무 기록 3개만 표시
  const recentRecords = workRecords.slice(0, 3);

  // 날짜 포맷팅 함수
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = days[date.getDay()];
    
    if (date.toDateString() === today.toDateString()) {
      return `오늘 (${dayOfWeek})`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `내일 (${dayOfWeek})`;
    } else {
      return `${date.getMonth() + 1}월 ${date.getDate()}일 (${dayOfWeek})`;
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="space-y-4">
        <UserProfile name={user?.name} email={user?.email} />

        <WageSettings />

        {nextWorkDate && nextWorkRecord && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-2">다음 출근</h2>
            <div className="space-y-1">
              <div className="text-xl font-bold text-blue-500">
                {formatDate(nextWorkDate)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(nextWorkRecord.startTime).getHours()}:
                {new Date(nextWorkRecord.startTime).getMinutes().toString().padStart(2, '0')} ~ 
                {new Date(nextWorkRecord.endTime).getHours()}:
                {new Date(nextWorkRecord.endTime).getMinutes().toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-3 font-medium transition-colors"
        >
          근무 등록하기
        </button>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-3">이번 달 예상 급여</h2>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-500">
                {monthlyWage.toLocaleString()}원
              </div>
              <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>4대보험 (9.39%)</span>
                  <span>-{monthlyDeductions.insurance.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t border-gray-200 dark:border-gray-700">
                  <span>실수령액</span>
                  <span className="text-green-600 dark:text-green-400">
                    {monthlyDeductions.netWage.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h2 className="text-lg font-semibold mb-3">최근 근무 기록</h2>
            {recentRecords.length > 0 ? (
              <div className="space-y-2">
                {recentRecords.map((record) => {
                  const date = new Date(record.date);
                  const startTime = new Date(record.startTime);
                  const endTime = new Date(record.endTime);
                  
                  return (
                    <div 
                      key={record.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <div>
                        {date.getMonth() + 1}월 {date.getDate()}일 
                        ({startTime.getHours()}:
                        {startTime.getMinutes().toString().padStart(2, '0')} ~ 
                        {endTime.getHours()}:
                        {endTime.getMinutes().toString().padStart(2, '0')})
                      </div>
                      <div className="font-medium">
                        {record.totalWage.toLocaleString()}원
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-foreground/60">
                아직 등록된 근무 기록이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      <WorkRegisterModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchWorkRecords();
        }}
      />
    </div>
  );
}
