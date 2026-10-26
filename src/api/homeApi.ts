
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
