import { useFetch } from "../hooks/useFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ... (Keep your existing YearlyReportData, UnallocatedYearlyData, MonthlyTotalsData types) ...

// Add Current Balance Type
export interface CurrentBalanceData {
  date: string;
  remainder: number;
}

// ... (Keep your existing useYearlyReport, useUnallocatedYearly, useMonthlyTotals hooks) ...

// Add Current Balance Hook
export const useCurrentBalance = () => {
  return useFetch<CurrentBalanceData>(`${BASE_URL}/balance/current`);
};

//-----------------------------------------------------------old
// ==========================================
// TYPES
// ==========================================

// Reusable type for basic totals
interface TotalWithCount {
  total: number;
  count: number;
}

// Reusable type for currency totals
interface CurrencyTotalWithCount extends TotalWithCount {
  currency: string;
}

// 1. Yearly Report Type
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

// 2. Unallocated Yearly Type
export interface UnallocatedYearlyData {
  year: number;
  transaction_income_usd: TotalWithCount;
  exchanged_to_af_usd: TotalWithCount;
  exchanged_to_af_afn: TotalWithCount; //
  unallocated_usd: number;
}

// 3. Monthly Totals Type
export interface MonthlyTotalsData {
  month: number;
  year: number;
  transaction_income_usd: TotalWithCount;
  exchanged_to_af_usd: TotalWithCount;
  exchanged_to_af_afn: TotalWithCount; // ✅
}

// ==========================================
// HOOKS
// ==========================================

/**
 * Get Yearly report (total income received in USD, exchanged to AFN, total expense).
 * @param year - (Optional) Year (YYYY)
 * @param month - (Optional) Month 1-12. If provided, returns that month. If omitted, returns the full year.
 */
export const useYearlyReport = (year?: number, month?: number) => {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());

  const queryString = params.toString() ? `?${params.toString()}` : "";

  return useFetch<YearlyReportData>(
    `${BASE_URL}/home/yearly-report${queryString}`,
  );
};

/**
 * Get yearly unallocated USD (total income received vs total allocated).
 * @param year - (Optional) Year (YYYY). Defaults to current year.
 */
export const useUnallocatedYearly = (year?: number) => {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());

  const queryString = params.toString() ? `?${params.toString()}` : "";

  return useFetch<UnallocatedYearlyData>(
    `${BASE_URL}/home/unallocated-yearly${queryString}`,
  );
};

/**
 * Get monthly USD totals (income and exchanged).
 * @param month - (Optional) Month 1-12. Defaults to current month.
 * @param year - (Optional) Year (YYYY). Defaults to current year.
 */
export const useMonthlyTotals = (month?: number, year?: number) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month.toString());
  if (year) params.append("year", year.toString());

  const queryString = params.toString() ? `?${params.toString()}` : "";

  return useFetch<MonthlyTotalsData>(
    `${BASE_URL}/home/monthly-totals${queryString}`,
  );
};
