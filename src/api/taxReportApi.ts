
import { useFetch } from "../hooks/useFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface YearlyTaxReport {
    year: number;
    total_amount_afn: number;
    total_expense: number;
    profit: number;
    tax_rate_percentage: number;
    yearly_tax: number;
}

export interface MonthlyTaxBreakdown {
    month_number: number;
    month_name: string;
    total_income: number;
    tax_rate: number;
    tax: number;
}

export interface QuarterlyTaxReport {
    quarter: string;
    months: number[];
    total_income: number;
    total_tax: number;
    breakdown: MonthlyTaxBreakdown[];
}

export interface QuarterlyTaxReportResponse {
    year: number;
    tax_rate_percentage: number;
    quarters: QuarterlyTaxReport[];
}

export function useYearlyTaxReport(year: number) {
    return useFetch<YearlyTaxReport>(
        `${BASE_URL}/home/yearly-tax?year=${year}`,
    );
}

export function useQuarterlyTaxReport(year: number) {
    return useFetch<QuarterlyTaxReportResponse>(
        `${BASE_URL}/home/quarterly?year=${year}`,
    );
}
