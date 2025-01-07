export interface Holiday {
  dateKind: string;     // 날짜 종류
  dateName: string;     // 공휴일 이름
  isHoliday: string;    // 공휴일 여부 ("Y" | "N")
  locdate: number;      // YYYYMMDD 형식의 날짜
  seq: number;          // 순번
}

// YYYYMMDD 형식의 날짜 문자열 생성
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// 공휴일 여부 확인 (공휴일만, 일요일 제외)
export function isHoliday(date: Date, holidays: Holiday[]): boolean {
  // 공휴일 체크
  const dateString = Number(formatDateForAPI(date));
  return holidays.some(holiday => 
    holiday.locdate === dateString && 
    holiday.isHoliday === "Y"
  );
}

// 주말 여부 확인
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0: 일요일, 6: 토요일
}

// 추가수당 배율 계산 (공휴일: 2.5배, 토요일: 1.5배, 일요일: 1.0배)
export function getWageMultiplier(date: Date, holidays: Holiday[]): number {
  if (isHoliday(date, holidays)) return 2.5; // 공휴일
return 1.0;                                // 평일 및 일요일
} 