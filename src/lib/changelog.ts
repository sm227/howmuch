export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const changelog: ChangelogEntry[] = [
    {
        version: "1.2.0",
        date: "2025-01-28",
        changes: [
          "Fix tax(3.3%) issues",
          
        ]
      },
  {
    version: "1.1.0",
    date: "2025-01-20",
    changes: [
      "bug fixes and performance improvements",
      
    ]
  },
  {
    version: "1.0.0",
    date: "2025-01-15",
    changes: [
      "Launch a service",
     
    ]
  }
];

export const getLatestVersion = () => {
  return changelog[0];
}; 