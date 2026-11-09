import { useFetch } from "../hooks/useFetch";
import { useCreate } from "../hooks/useCreate";
import { useUpdate } from "../hooks/useUpdate";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface OtherExpense {
  id?: number;
  expense_id?: number;
  description: string;
  amount: number;
  category_id: number;
  currency: string;
  expense_date: string;
  note?: string | null;
  category_title?: string;
  created_at?: string;
  updated_at?: string;
}

// ✅ show the data filtering by month.
export interface OtherExpenseByMonthData {
  total_amount: number;
  count: number;
  expenses: OtherExpense[];
}

// ✅ New Type for the Grouped 3-Month Data
export interface OtherExpenseMonthlyGroup {
  month: number;
  year: number;
  label: string;
  total: number;
  count: number;
  data: OtherExpense[];
}

export type CreateOtherExpenseType = Omit<
  OtherExpense,
  "id" | "expense_id" | "category_title" | "created_at" | "updated_at">;

export type UpdateOtherExpenseType = Partial<CreateOtherExpenseType>;

// 1. Get ALL
export const getAllOtherExpenses = (enabled = true) =>
  useFetch<OtherExpense[]>(`${BASE_URL}/other-expenses`, enabled);

// ✅ 2. Get RECENT (Last 3 Months)
export const getRecentOtherExpenses = (enabled = true) =>
  useFetch<OtherExpenseMonthlyGroup[]>(
    `${BASE_URL}/other-expenses/last-three-months`,
    enabled,
  );

export const getOtherExpenseById = (id: number | string) =>
  useFetch<OtherExpense>(`${BASE_URL}/other-expenses/${id}`);

export const createOtherExpense = () =>
  useCreate<OtherExpense>(`${BASE_URL}/other-expenses`);

export const updateOtherExpense = () =>
  useUpdate<OtherExpense>(`${BASE_URL}/other-expenses`);

export const getOtherExpensesByMonth = (
  month: number,
  year: number,
  enabled = true,
) =>
  useFetch<OtherExpenseByMonthData>(
    `${BASE_URL}/other-expenses/by-month?month=${month}&year=${year}`,
    enabled,
  );