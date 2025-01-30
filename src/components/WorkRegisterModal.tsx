'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { isHoliday, isWeekend, getWageMultiplier } from '@/lib/holiday';
import type { Holiday } from '@/lib/holiday';
import { calculateDeductions } from '@/lib/wage';
import type { WageDeduction } from '@/lib/wage';

interface WorkRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date | null;
  onSuccess?: () => void;
  workRecord?: WorkRecord | null;
}

export default function WorkRegisterModal({ 
  isOpen, 
  onClose, 
  selectedDate,
  onSuccess,
  workRecord 
}: WorkRegisterModalProps) {
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [breakTime, setBreakTime] = useState<number>(0);
  const [hourlyWage, setHourlyWage] = useState<number>(0);
  const [totalWage, setTotalWage] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [autoBreakTime, setAutoBreakTime] = useState<boolean>(true);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [deductions, setDeductions] = useState<WageDeduction>({
    totalWage: 0,
    tax: 0,
    insurance: 0,
    netWage: 0,
  });

  // 수정 모드인지 확인
  const isEditMode = !!workRecord;

  // 모달이 닫힐 때 모든 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setDate('');
      setStartTime('');
      setEndTime('');
      setBreakTime(0);
      setTotalWage(0);
    }
  }, [isOpen]);

  // 선정된 시급 가져오기
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setHourlyWage(data.hourlyWage);
          setAutoBreakTime(data.autoBreakTime);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // 선택된 날짜가 있으면 자동으로 설정
  useEffect(() => {
    if (selectedDate) {
      // 로컬 시간 기준으로 날짜 포맷팅
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
    }
  }, [selectedDate]);

  // 자동 휴게시간 계산
  const calculateAutoBreakTime = (workMinutes: number) => {
    if (!autoBreakTime) return 0;
    
    if (workMinutes >= 480) { // 8시간 이상
      return 60;
    } else if (workMinutes >= 240) { // 4시간 이상
      return 30;
    }
    return 0;
  };

  // 공휴일 정보 가져오기
  useEffect(() => {
    const fetchHolidays = async () => {
      if (!date) return;

      const [year, month] = date.split('-');
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

    fetchHolidays();
  }, [date]);

  // 근무시간과 급여 계산
  useEffect(() => {
    if (!startTime || !endTime || !hourlyWage || !date) return;

    const workDate = new Date(date);
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    if (autoBreakTime) {
      const calculatedBreakTime = calculateAutoBreakTime(diffInMinutes);
      setBreakTime(calculatedBreakTime);
    }
    
    const workMinutes = diffInMinutes - breakTime;
    const workHours = workMinutes / 60;
    
    const multiplier = getWageMultiplier(workDate, holidays);
    const grossWage = Math.round(workHours * hourlyWage * multiplier);
    
    // 공제 계산
    const deductionInfo = calculateDeductions(grossWage);
    setDeductions(deductionInfo);
    setTotalWage(grossWage);
  }, [startTime, endTime, breakTime, hourlyWage, autoBreakTime, date, holidays]);

  // 시간 입력 핸들러
  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>, setTime: (time: string) => void) => {
    let value = e.target.value;
    
    // 숫자와 콜론만 허용
    if (!/^[0-9:]*$/.test(value)) {
      return;
    }

    // 콜론 제거
    value = value.replace(/:/g, '');

    // 4자리 넘어가면 자르기
    if (value.length > 4) {
      value = value.slice(0, 4);
    }

    // 시간 검증 및 포맷팅
    if (value.length >= 2) {
      const hours = parseInt(value.slice(0, 2));
      if (hours > 23) {
        value = '23' + value.slice(2);
      }
    }

    // 분 검증
    if (value.length === 4) {
      const minutes = parseInt(value.slice(2));
      if (minutes > 59) {
        value = value.slice(0, 2) + '59';
      }
    }

    // 출력 포맷팅
    if (value.length > 2) {
      value = value.slice(0, 2) + ':' + value.slice(2);
    }

    setTime(value);
  };

  // 기존 데이터 로드
  useEffect(() => {
    if (workRecord) {
      const recordDate = new Date(workRecord.date);
      const year = recordDate.getFullYear();
      const month = String(recordDate.getMonth() + 1).padStart(2, '0');
      const day = String(recordDate.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);

      const startDateTime = new Date(workRecord.startTime);
      const endDateTime = new Date(workRecord.endTime);
      
      setStartTime(`${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}`);
      setEndTime(`${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`);
      setBreakTime(workRecord.breakTime);
      setHourlyWage(workRecord.wage);
      setTotalWage(workRecord.totalWage);
    }
  }, [workRecord]);

  // 삭제 핸들러 추가
  const handleDelete = async () => {
    if (!workRecord || !confirm('정말 삭제하시겠습니까?')) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/work-records/${workRecord.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete work record');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error deleting work record:', error);
      alert('근무 기록 삭제에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // handleSubmit 수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !startTime || !endTime) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      const [year, month, day] = date.split('-').map(Number);
      const submitDate = new Date(year, month - 1, day);
      submitDate.setHours(0, 0, 0, 0);

      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode 
        ? `/api/work-records/${workRecord.id}`
        : '/api/work-records';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          date: submitDate.toISOString(),
          startTime,
          endTime,
          breakTime,
          wage: hourlyWage,
          totalWage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} work record`);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} work record:`, error);
      alert(`근무 기록 ${isEditMode ? '수정' : '저장'}에 실패했습니다.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 p-4">
        <h2 className="text-xl font-bold">
          {isEditMode ? '근무 수정' : '근무 등록'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              날짜
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-2 dark:bg-zinc-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              시작 시간
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={startTime}
              onChange={(e) => handleTimeInput(e, setStartTime)}
              placeholder="0900"
              maxLength={5}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-2 dark:bg-zinc-700"
              required
            />
            <span className="text-xs text-gray-500 mt-1">
              예시: 0900 (오전 9시), 0930 (오전 9시 30분), 1430 (오후 2시 30분)
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              종료 시간
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={endTime}
              onChange={(e) => handleTimeInput(e, setEndTime)}
              placeholder="1800"
              maxLength={5}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-2 dark:bg-zinc-700"
              required
            />
            <span className="text-xs text-gray-500 mt-1">
              예시: 1800 (오후 6시), 2230 (오후 10시 30분)
            </span>
          </div>

          <div>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={autoBreakTime}
                onChange={(e) => {
                  setAutoBreakTime(e.target.checked);
                  if (!e.target.checked) {
                    setBreakTime(0); // 자동 계산을 끄면 휴게시간 초기화
                  }
                }}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">휴게시간 자동 계산</span>
            </label>
            <div className="text-xs text-gray-500 mb-2">
              4시간 이상: 30분 휴게 / 8시간 이상: 1시간 휴게
            </div>

            <label className="block text-sm font-medium mb-1">
              휴게시간 (분)
            </label>
            <input
              type="number"
              value={breakTime}
              onChange={(e) => setBreakTime(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-2 dark:bg-zinc-700"
              min="0"
              step="10"
              disabled={autoBreakTime}
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">총 급여</span>
                <span className="text-xl font-bold text-blue-500">
                  {totalWage.toLocaleString()}원
                </span>
              </div>
              
              <div className="text-sm space-y-1">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>4대보험 (9.39%)</span>
                  <span>-{deductions.insurance.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t border-gray-200 dark:border-gray-700">
                  <span>실수령액</span>
                  <span className="text-green-600 dark:text-green-400">
                    {deductions.netWage.toLocaleString()}원
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                시급 {hourlyWage.toLocaleString()}원 기준
                {date && isHoliday(new Date(date), holidays) && (
                  <span className="text-red-500 ml-1">
                    (공휴일 수당 2.5배)
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  disabled={isSubmitting}
                >
                  삭제
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? '저장 중...' : (isEditMode ? '수정' : '저장')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
} 