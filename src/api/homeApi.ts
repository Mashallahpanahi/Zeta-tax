import { useFetch } from "../hooks/useFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ==========================================
// FRIEND'S TYPES (For HomePage)
// ==========================================

interface AmountCount {
  total: number;
  count: number;
}

interface CurrencyAmountCount {
  currency?: string;
  total: number;
  count: number;
}

export interface HomeYearlyReport {
  month?: number;
  year: number;
  exchange_income: CurrencyAmountCount;
  transaction_income: CurrencyAmountCount;
  total_expense: AmountCount & {
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
  exchanged_to_af_afn: AmountCount;
  unallocated_usd: number;
  total_expense?: AmountCount;
}

export interface HomeMonthlyTotals {
  month: number;
  year: number;
  transaction_income_usd: AmountCount;
  exchanged_to_af_usd: AmountCount;
  exchanged_to_af_afn: AmountCount;
  total_expense?: AmountCount;
}

export interface CurrentCashBalance {
  date: string;
  remainder: number;
}

// ==========================================
// FRIEND'S HOOKS
// ==========================================

export const getHomeYearlyReport = (year: number, month?: number) => {
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

export const getHomeMonthlyTotals = (month: number, year: number) =>
  useFetch<HomeMonthlyTotals>(
    `${BASE_URL}/home/monthly-totals?month=${month}&year=${year}`,
  );

export const getCurrentCashBalance = () =>
  useFetch<CurrentCashBalance>(`${BASE_URL}/balance/current`);
