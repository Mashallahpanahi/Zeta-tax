import { useFetch } from "../hooks/useFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ==========================================
// TYPES
// ==========================================

export interface TotalWithCount {
  total: number;
  count: number;
}

export interface CurrencyTotalWithCount extends TotalWithCount {
  currency: string;
}

export interface YearlyReportData {
  month: number;
  year: number;
  exchange_income: CurrencyTotalWithCount;
  transaction_income: CurrencyTotalWithCount;
  total_expense: TotalWithCount & {
    breakdown: {
      other_expenses: TotalWithCount;
      payrolls: TotalWithCount;
    };
  };
}

export interface UnallocatedYearlyData {
  year: number;
  transaction_income_usd: TotalWithCount;
  exchanged_to_af_usd: TotalWithCount;
  exchanged_to_af_afn: TotalWithCount;
  unallocated_usd: number;
  total_expense?: TotalWithCount;
}

export interface MonthlyTotalsData {
  month: number;
  year: number;
  transaction_income_usd: TotalWithCount;
  exchanged_to_af_usd: TotalWithCount;
  exchanged_to_af_afn: TotalWithCount;
  total_expense?: TotalWithCount;
}

export interface CurrentBalanceData {
  date: string;
  remainder: number;
}

// ==========================================
// HOOKS
// ==========================================

export const useYearlyReport = (year?: number, month?: number) => {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return useFetch<YearlyReportData>(
    `${BASE_URL}/home/yearly-report${queryString}`,
  );
};

export const useUnallocatedYearly = (year?: number) => {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return useFetch<UnallocatedYearlyData>(
    `${BASE_URL}/home/unallocated-yearly${queryString}`,
  );
};

export const useMonthlyTotals = (month?: number, year?: number) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month.toString());
  if (year) params.append("year", year.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return useFetch<MonthlyTotalsData>(
    `${BASE_URL}/home/monthly-totals${queryString}`,
  );
};

// ✅ ENSURE THIS IS EXPORTED
export const useCurrentBalance = () => {
  return useFetch<CurrentBalanceData>(`${BASE_URL}/balance/current`);
};
