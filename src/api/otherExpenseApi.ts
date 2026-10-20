
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

export type CreateOtherExpenseType = Omit<
    OtherExpense,
    "id" | "expense_id" | "category_title" | "created_at" | "updated_at"
>;

export type UpdateOtherExpenseType = Partial<CreateOtherExpenseType>;

export const getAllOtherExpenses = () =>
    useFetch<OtherExpense[]>(`${BASE_URL}/other-expenses`);

export const getOtherExpenseById = (id: number | string) =>
    useFetch<OtherExpense>(`${BASE_URL}/other-expenses/${id}`);

export const createOtherExpense = () =>
    useCreate<OtherExpense>(`${BASE_URL}/other-expenses`);

export const updateOtherExpense = () =>
    useUpdate<OtherExpense>(`${BASE_URL}/other-expenses`);
