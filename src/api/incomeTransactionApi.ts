import { useFetch } from "../hooks/useFetch";
import { useUpdate } from "../hooks/useUpdate";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type IncomeTransactionType = Record<string, unknown>;

export const getAllIncomeTransactions = () =>
  useFetch<IncomeTransactionType[]>(`${BASE_URL}/transaction-receive-income`);

export const updateIncomeTransaction = () =>
  useUpdate<IncomeTransactionType>(`${BASE_URL}/transaction-receive-income`);

export const deleteIncomeTransaction = async (id: number) => {
  const response = await fetch(`${BASE_URL}/transaction-receive-income/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Failed to delete transaction (${response.status})`,
    );
  }

  return true;
};
