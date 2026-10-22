import { useFetch } from "../hooks/useFetch";
import { useUpdate } from "../hooks/useUpdate";
import { useCreate } from "../hooks/useCreate";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface IncomeTransactionType {
  id?: string | number;
  income_id?: string | number;
  transaction_id?: string | number;
  _id?: string | number;
  date: string;
  amount: number;
  currency: string;
  recorded_by: string;
  received_from: string;
  income_type: string;
  description: string;
  used?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

// New type for the grouped 3-month data
export interface MonthlyIncomeType {
  month: number;
  year: number;
  label: string;
  total: number;
  count: number;
  data: IncomeTransactionType[];
}

// 1. Get all (for the "Show All" button)
export const getAllIncomeTransactions = () =>
  useFetch<IncomeTransactionType[]>(`${BASE_URL}/transaction-receive-income`);

// 2. Get last 3 months (Default view)
export const getRecentIncomeTransactions = () =>
  useFetch<MonthlyIncomeType[]>(`${BASE_URL}/transaction-receive-income/last-three-months`);

export const createIncomeTransaction = () =>
  useCreate<IncomeTransactionType>(`${BASE_URL}/transaction-receive-income`);

export const updateIncomeTransaction = () =>
  useUpdate<IncomeTransactionType>(`${BASE_URL}/transaction-receive-income`);