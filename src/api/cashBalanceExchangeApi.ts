import { useFetch } from "../hooks/useFetch";
import { useCreate } from "../hooks/useCreate";
import { useUpdate } from "../hooks/useUpdate";
import { useDelete } from "../hooks/useDelete";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ReceivedIncomeTransaction {
  income_id: number;
  amount_of: number;
  currency?: string;
  used?: boolean;
  amount_used?: number;
  com_transaction_id?: number;
}

export interface CashBalanceExchange {
  exchange_id: number;
  date_of_exchange: string;
  ex_rate: number;
  amount_af: number;
  amount_usd?: number; // Added this as backend sometimes returns it
  cash_flow_and_remainder: number;
  received_income_transaction_id: number;
  received_income_transaction?: ReceivedIncomeTransaction;
}

export interface LatestBalance {
  date: string | null;
  remainder: number;
  balance_id: number | string | null;
}

export interface CreateCashBalanceExchangeType {
  date_of_exchange: string;
  ex_rate: number;
  amount_usd: number;
  amount_af: number;
  cash_flow_and_remainder: number;
  received_income_transaction_id: number;
}

export type UpdateCashBalanceExchangeType =
  Partial<CreateCashBalanceExchangeType>;

// ✅ New Type for the Grouped 3-Month Data
export interface MonthlyCashExchangeType {
  month: number;
  year: number;
  label: string;
  total: number;
  total_usd: number;
  count: number;
  data: CashBalanceExchange[];
}

// 1. Get ALL
export function getAllCashBalanceExchanges() {
  return useFetch<CashBalanceExchange[]>(
    `${BASE_URL}/cash-balance-exchanged-to-af`,
  );
}

// ✅ 2. Get RECENT (Last 3 Months)
export function getRecentCashBalanceExchanges() {
  return useFetch<MonthlyCashExchangeType[]>(
    `${BASE_URL}/cash-balance-exchanged-to-af/last-three-months`,
  );
}

export function getLatestBalance() {
  return useFetch<LatestBalance>(`${BASE_URL}/balance/latest`);
}

export function createCashBalanceExchange() {
  return useCreate<CashBalanceExchange>(
    `${BASE_URL}/cash-balance-exchanged-to-af`,
  );
}

export function updateCashBalanceExchange() {
  return useUpdate<CashBalanceExchange>(
    `${BASE_URL}/cash-balance-exchanged-to-af`,
  );
}

export function deleteCashBalanceExchange() {
  return useDelete<CashBalanceExchange>(
    `${BASE_URL}/cash-balance-exchanged-to-af`,
  );
}
