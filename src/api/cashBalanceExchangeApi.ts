import { useFetch } from "../hooks/useFetch";
import { useCreate } from "../hooks/useCreate";
import { useUpdate } from "../hooks/useUpdate";
import { useDelete } from "../hooks/useDelete";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Income transaction associated with an exchange
export interface ReceivedIncomeTransaction {
    income_id: number;
    amount_of: number;
    currency?: string;
    used?: boolean;
    amount_used?: number;
    com_transaction_id?: number;
}

// Cash balance exchange record
export interface CashBalanceExchange {
    exchange_id: number;
    date_of_exchange: string;
    ex_rate: number;
    amount_af: number;
    cash_flow_and_remainder: number;
    received_income_transaction_id: number;
    received_income_transaction?: ReceivedIncomeTransaction;
}

// Latest balance record returned by GET /balance/latest
export interface LatestBalance {
    date: string | null;
    remainder: number;
    balance_id: number | string | null;
}

// Data required to create an exchange
export interface CreateCashBalanceExchangeType {
    date_of_exchange: string;
    ex_rate: number;
    amount_usd: number;
    amount_af: number;
    cash_flow_and_remainder: number;
    received_income_transaction_id: number;
}

// Data allowed when updating an exchange
export type UpdateCashBalanceExchangeType =
    Partial<CreateCashBalanceExchangeType>;

// Fetch all cash balance exchanges
export function getAllCashBalanceExchanges() {
    return useFetch<CashBalanceExchange[]>(
        `${BASE_URL}/cash-balance-exchanged-to-af`,
    );
}

// Fetch the latest balance entry
export function getLatestBalance() {
    return useFetch<LatestBalance>(`${BASE_URL}/balance/latest`);
}

// Create a cash balance exchange
export function createCashBalanceExchange() {
    return useCreate<CashBalanceExchange>(
        `${BASE_URL}/cash-balance-exchanged-to-af`,
    );
}

// Update a cash balance exchange
export function updateCashBalanceExchange() {
    return useUpdate<CashBalanceExchange>(
        `${BASE_URL}/cash-balance-exchanged-to-af`,
    );
}

// Delete a cash balance exchange
export function deleteCashBalanceExchange() {
    return useDelete<CashBalanceExchange>(
        `${BASE_URL}/cash-balance-exchanged-to-af`,
    );
}
