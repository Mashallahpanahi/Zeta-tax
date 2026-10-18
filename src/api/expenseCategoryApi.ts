
import { useFetch } from "../hooks/useFetch";
import { useDelete } from "../hooks/useDelete";
import { useCreate } from "../hooks/useCreate";
import { useUpdate } from "../hooks/useUpdate";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ---------- Types ----------
export interface ExpenseCategoryType {
    category_id: string;
    category_title: string;
    description: string;
    created_at: string;
    updated_at: string;
    status: "active" | "inactive";
}

export interface CreateExpenseCategoryType {
    category_title: string;
    description: string;
}

export type UpdateExpenseCategoryType =
    Partial<CreateExpenseCategoryType> & {
        status?: "active" | "inactive";
    };

// ---------- GET ----------
export const getAllExpenseCategories = () =>
    useFetch<ExpenseCategoryType[]>(
        `${BASE_URL}/category-for-expenses`,
    );

// ---------- CREATE ----------
export const createExpenseCategory = () =>
    useCreate<ExpenseCategoryType>(
        `${BASE_URL}/category-for-expenses`,
    );

// ---------- UPDATE ----------
export const updateExpenseCategory = () =>
    useUpdate<ExpenseCategoryType>(
        `${BASE_URL}/category-for-expenses`,
    );

// ---------- DELETE ----------
export const deleteExpenseCategory = () =>
    useDelete<ExpenseCategoryType>(
        `${BASE_URL}/category-for-expenses`,
    );
