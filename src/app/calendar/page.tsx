'use client';

import { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import WorkRegisterModal from '@/components/WorkRegisterModal';
import { WorkRecord } from '@prisma/client';
import type { Holiday } from '@/lib/holiday';

export default function CalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<WorkRecord | null>(null);
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // 근무 기록 가져오기
  const fetchWorkRecords = async () => {
    try {
      const response = await fetch('/api/work-records');
      if (response.ok) {
        const data = await response.json();
        setWorkRecords(data);
      }
    } catch (error) {
      console.error('Failed to fetch work records:', error);
    }
  };

  // 공휴일 정보 가져오기
  const fetchHolidays = async (year: number, month: number) => {
    try {
      const response = await fetch(
        `/api/holidays?year=${year}&month=${month}`
      );
      if (response.ok) {
        const data = await response.json();
        setHolidays(data);
      }
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
    }
  };

  useEffect(() => {
    const now = new Date();
    fetchWorkRecords();
    fetchHolidays(now.getFullYear(), now.getMonth() + 1);
  }, []);

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-xl font-bold">근무 달력</h1>
      </header>

      <Calendar 
        workRecords={workRecords}
        holidays={holidays}
        onDateSelect={(date, record) => {
          setSelectedDate(date);
          setSelectedRecord(record || null);
          setIsModalOpen(true);
        }} 
      />

      <WorkRegisterModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDate(null);
          setSelectedRecord(null);
        }}
        selectedDate={selectedDate}
        workRecord={selectedRecord}
        holidays={holidays}
        onSuccess={() => {
          fetchWorkRecords();
        }}
      />
    </div>
  );
} 