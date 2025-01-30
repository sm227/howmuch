'use client';

import { changelog } from '@/lib/changelog';

export default function ChangelogPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">업데이트 기록</h1>
      <div className="space-y-8">
        {changelog.map((entry) => (
          <div key={entry.version} className="border-l-2 border-blue-500 pl-4">
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="text-lg font-semibold">v{entry.version}</h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">{entry.date}</span>
            </div>
            <ul className="space-y-1">
              {entry.changes.map((change, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  • {change}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
} 