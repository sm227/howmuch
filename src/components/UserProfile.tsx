'use client';

interface UserProfileProps {
  name?: string | null;
  email?: string | null;
}

export default function UserProfile({ name, email }: UserProfileProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 rounded-full p-3">
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
              />
            </svg>
          </div>
          <div>
            <div className="font-medium text-lg">
              {name || '사용자'}님, 안녕하세요!
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
