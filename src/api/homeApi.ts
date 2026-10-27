
import { useFetch } from "../hooks/useFetch"
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// ---------- Response Types ----------
interface AmountCount {
    total: number;
    count: number;
}
export interface HomeYearlyReport {
    month?: number;
    year: number;
    exchange_income: {
        currency: string;
        total: number;
        count: number;
    };
    transaction_income: {
        currency: string;
        total: number;
        count: number;
    };
    total_expense: {
        total: number;
        count: number;
        breakdown: {
            other_expenses: AmountCount;
            payrolls: AmountCount;
        };
    };
}

export interface HomeUnallocatedReport {
    year: number;
    transaction_income_usd: AmountCount;
    exchanged_to_af_usd: AmountCount;
    unallocated_usd: number;
}

export interface HomeMonthlyTotals {
    month: number;
    year: number;
    transaction_income_usd: AmountCount;
    exchanged_to_af_usd: AmountCount;
}
// ---------- API Hooks ----------
export const getHomeYearlyReport = (
    year: number,
    month?: number,
) => {
    const params = new URLSearchParams({ year: String(year) });
    if (month !== undefined) {
        params.set("month", String(month));
    }
    return useFetch<HomeYearlyReport>(
        `${BASE_URL}/home/yearly-report?${params.toString()}`,
    );
};
export const getHomeUnallocatedYearly = (year: number) =>
    useFetch<HomeUnallocatedReport>(
        `${BASE_URL}/home/unallocated-yearly?year=${year}`,
    );
export const getHomeMonthlyTotals = (
    month: number,
    year: number,
) =>
    useFetch<HomeMonthlyTotals>(
        `${BASE_URL}/home/monthly-totals?month=${month}&year=${year}`,
    );

export interface CurrentCashBalance {
    date: string;
    remainder: number;
}

export const getCurrentCashBalance = () =>
    useFetch<CurrentCashBalance>(`${BASE_URL}/balance/current`);
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
  total_expense?: TotalWithCount;
}

// 3. Monthly Totals Type
export interface MonthlyTotalsData {
  month: number;
  year: number;
  transaction_income_usd: TotalWithCount;
  exchanged_to_af_usd: TotalWithCount;
  exchanged_to_af_afn: TotalWithCount; // ✅
   total_expense?: TotalWithCount;
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
