'use client';

import { useState, useEffect } from 'react';

export default function WageSettings() {
  const [hourlyWage, setHourlyWage] = useState(9860);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setHourlyWage(data.hourlyWage);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hourlyWage }),
      });

      if (response.ok) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">시급 설정</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            수정
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm text-gray-500 hover:text-gray-600"
              disabled={isSaving}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="text-sm text-blue-500 hover:text-blue-600"
              disabled={isSaving}
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <input
          type="number"
          value={hourlyWage}
          onChange={(e) => setHourlyWage(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-2 dark:bg-zinc-700"
          min="0"
          step="10"
        />
      ) : (
        <div className="text-2xl font-bold">
          {hourlyWage.toLocaleString()}원/시간
        </div>
      )}
    </div>
  );
} 