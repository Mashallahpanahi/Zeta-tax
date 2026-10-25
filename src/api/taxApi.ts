import { useFetch } from "../hooks/useFetch";
import { useCreate } from "../hooks/useCreate";
import { useUpdate } from "../hooks/useUpdate";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ---------- Types ----------
export interface TaxType {
  tax_id: string;
  quarterly: string | number;
  yearly: string | number;
  salary_range_under_10k: string | number;
  salary_range_above_10k: string | number;
  salary_range_above_100k: string | number;
  rent_under_10k: string | number;
  rent_above_10k: string | number;
  rent_above_100k: string | number;
  created_at: string;
  updated_at: string;
}

// Type for the form (without ID and timestamps)
export type TaxFormData = Omit<TaxType, "tax_id" | "created_at" | "updated_at">;

// ---------- GET ----------
export const getTaxes = () => useFetch<TaxType[]>(`${BASE_URL}/table-tax`);

// ---------- CREATE ----------
export const createTax = () => useCreate<TaxType>(`${BASE_URL}/table-tax`);

// ---------- UPDATE ----------
export const updateTax = () => useUpdate<TaxType>(`${BASE_URL}/table-tax`);