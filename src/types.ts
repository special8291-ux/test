export type MascotType = "bunny" | "squirrel";

export type InvestmentInclination = "seed" | "sprout" | "tree";

export interface AllowanceItem {
  id: string;
  name: string;
  amount: number;
  category: "standard" | "overtime" | "custom";
  isCustom?: boolean;
  description?: string;
  enabled?: boolean;
}

export interface DeductionItem {
  id: string;
  name: string;
  amount: number;
  category: "pension" | "tax" | "insurance" | "custom";
  isCustom?: boolean;
  description?: string;
  enabled?: boolean;
}

export interface SalarySummary {
  baseSalary: number;
  totalAllowances: number;
  totalGross: number; // 총지급액 = 기본급 + 수당
  totalDeductions: number; // 총공제액
  netPay: number; // 실수령액 = 총지급액 - 총공제액
  annualNetPay: number; // 연간 예상 실수령액 (명절휴가비 120% + 정근수당 등 포함)
}

export interface TutorAdvice {
  mascotMessage: string;
  financialHealthScore: number;
  allocation: {
    savings: number; // 예적금 & 교직원공제회
    dividendEtf: number; // 배당 ETF / 배당주
    indexEtf: number; // 지수 ETF / 성장주
    emergencyFund: number; // 비상금 / 파킹통장
  };
  teacherTips: string[];
  actionPlan: {
    step: string;
    desc: string;
  }[];
  encouragementQuote: string;
}

export interface OCRResult {
  baseSalary: number;
  step?: number;
  allowances: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  notes: string;
}

export interface TeacherPreset {
  id: string;
  title: string;
  step: number;
  description: string;
  badge: string;
  allowanceIds: string[];
}
