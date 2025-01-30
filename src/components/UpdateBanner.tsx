'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getLatestVersion } from '@/lib/changelog';

export default function UpdateBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const latestVersion = getLatestVersion();

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-100 dark:border-blue-900">
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-blue-600 dark:text-blue-400">
            v{latestVersion.version} 업데이트
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            {latestVersion.changes[0]}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/changelog" 
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            자세히 보기
          </Link>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
} 