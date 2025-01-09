'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SettingsModal({ isOpen, onClose, onSuccess }: SettingsModalProps) {
  const [hourlyWage, setHourlyWage] = useState<number>(9860);
  const [autoBreakTime, setAutoBreakTime] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setHourlyWage(data.hourlyWage);
          setAutoBreakTime(data.autoBreakTime);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          hourlyWage,
          autoBreakTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 p-4">
        <h2 className="text-xl font-bold">설정</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              시급 (원)
            </label>
            <input
              type="number"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-2 dark:bg-zinc-700"
              min="9860"
              step="10"
              required
            />
            <span className="text-xs text-gray-500 mt-1">
              최저시급(9,860원) 이상 입력해주세요.
            </span>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoBreakTime}
                onChange={(e) => setAutoBreakTime(e.target.checked)}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">휴게시간 자동 계산</span>
            </label>
            <div className="text-xs text-gray-500 mt-1">
              4시간 이상: 30분 휴게 / 8시간 이상: 1시간 휴게
            </div>
          </div>

          <div className="flex gap-2 pt-4">
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
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
} 