// 세금 및 보험료 계산 함수
export interface WageDeduction {
  totalWage: number;      // 총 급여
  tax: number;           // 세금 (0%)
  insurance: number;     // 4대보험 (9.39%)
  netWage: number;       // 실수령액
}

export function calculateDeductions(grossWage: number): WageDeduction {
  const tax = 0;                                  // 세금 제거
  const insurance = Math.floor(grossWage * 0.0939);  // 9.39% 4대보험
  const netWage = grossWage - tax - insurance;       // 실수령액

  return {
    totalWage: grossWage,
    tax,
    insurance,
    netWage,
  };
} 