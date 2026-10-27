import { useFetch } from "../hooks/useFetch";
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

export interface CurrentCashBalance {
  date: string;
  remainder: number;
}

export const getCurrentCashBalance = () =>
  useFetch<CurrentCashBalance>(`${BASE_URL}/balance/current`);

// finanacial Summary api and H-dashboard api typ togater

// import { useFetch } from "../hooks/useFetch";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // ==========================================
// // TYPES
// // ==========================================

// interface TotalWithCount {
//   total: number;
//   count: number;
// }

// interface CurrencyTotalWithCount extends TotalWithCount {
//   currency: string;
// }

// // --- YOUR TYPES (For FinancialSummary) ---
// export interface YearlyReportData {
//   month: number;
//   year: number;
//   exchange_income: CurrencyTotalWithCount;
//   transaction_income: CurrencyTotalWithCount;
//   total_expense: TotalWithCount & {
//     breakdown: {
//       other_expenses: TotalWithCount;
//       payrolls: TotalWithCount;
//     };
//   };
// }

// export interface UnallocatedYearlyData {
//   year: number;
//   transaction_income_usd: TotalWithCount;
//   exchanged_to_af_usd: TotalWithCount;
//   exchanged_to_af_afn: TotalWithCount;
//   unallocated_usd: number;
//   total_expense?: TotalWithCount;
// }

// export interface MonthlyTotalsData {
//   month: number;
//   year: number;
//   transaction_income_usd: TotalWithCount;
//   exchanged_to_af_usd: TotalWithCount;
//   exchanged_to_af_afn: TotalWithCount;
//   total_expense?: TotalWithCount;
// }

// export interface CurrentBalanceData {
//   date: string;
//   remainder: number;
// }

// // --- FRIEND'S TYPES (For HomePage) ---
// export interface HomeYearlyReport {
//   month?: number;
//   year: number;
//   exchange_income: CurrencyTotalWithCount;
//   transaction_income: CurrencyTotalWithCount;
//   total_expense: TotalWithCount & {
//     breakdown: {
//       other_expenses: TotalWithCount;
//       payrolls: TotalWithCount;
//     };
//   };
// }

// export interface HomeUnallocatedReport {
//   year: number;
//   transaction_income_usd: TotalWithCount;
//   exchanged_to_af_usd: TotalWithCount;
//   exchanged_to_af_afn: TotalWithCount;
//   unallocated_usd: number;
//   total_expense?: TotalWithCount;
// }

// export interface HomeMonthlyTotals {
//   month: number;
//   year: number;
//   transaction_income_usd: TotalWithCount;
//   exchanged_to_af_usd: TotalWithCount;
//   exchanged_to_af_afn: TotalWithCount;
//   total_expense?: TotalWithCount;
// }

// export interface CurrentCashBalance {
//   date: string;
//   remainder: number;
// }

// // ==========================================
// // HOOKS
// // ==========================================

// // --- YOUR HOOKS (For FinancialSummary) ---
// export const useYearlyReport = (year?: number, month?: number) => {
//   const params = new URLSearchParams();
//   if (year) params.append("year", year.toString());
//   if (month) params.append("month", month.toString());
//   const queryString = params.toString() ? `?${params.toString()}` : "";
//   return useFetch<YearlyReportData>(
//     `${BASE_URL}/home/yearly-report${queryString}`,
//   );
// };

// export const useUnallocatedYearly = (year?: number) => {
//   const params = new URLSearchParams();
//   if (year) params.append("year", year.toString());
//   const queryString = params.toString() ? `?${params.toString()}` : "";
//   return useFetch<UnallocatedYearlyData>(
//     `${BASE_URL}/home/unallocated-yearly${queryString}`,
//   );
// };

// export const useMonthlyTotals = (month?: number, year?: number) => {
//   const params = new URLSearchParams();
//   if (month) params.append("month", month.toString());
//   if (year) params.append("year", year.toString());
//   const queryString = params.toString() ? `?${params.toString()}` : "";
//   return useFetch<MonthlyTotalsData>(
//     `${BASE_URL}/home/monthly-totals${queryString}`,
//   );
// };

// export const useCurrentBalance = () => {
//   return useFetch<CurrentBalanceData>(`${BASE_URL}/balance/current`);
// };

// // --- FRIEND'S HOOKS (For HomePage) ---
// export const getHomeYearlyReport = (year: number, month?: number) => {
//   const params = new URLSearchParams({ year: String(year) });
//   if (month !== undefined) {
//     params.set("month", String(month));
//   }
//   return useFetch<HomeYearlyReport>(
//     `${BASE_URL}/home/yearly-report?${params.toString()}`,
//   );
// };

// export const getHomeUnallocatedYearly = (year: number) =>
//   useFetch<HomeUnallocatedReport>(
//     `${BASE_URL}/home/unallocated-yearly?year=${year}`,
//   );

// export const getHomeMonthlyTotals = (month: number, year: number) =>
//   useFetch<HomeMonthlyTotals>(
//     `${BASE_URL}/home/monthly-totals?month=${month}&year=${year}`,
//   );

// export const getCurrentCashBalance = () =>
//   useFetch<CurrentCashBalance>(`${BASE_URL}/balance/current`);
