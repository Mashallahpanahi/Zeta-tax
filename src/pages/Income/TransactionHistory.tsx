import { useState } from "react";
import { ArrowLeft, Eye, X } from "lucide-react";
import {
  getAllIncomeTransactions,
  type IncomeTransactionType,
} from "../../api/incomeTransactionApi";

type TransactionHistoryProps = {
  onBack: () => void;
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function formatColumnTitle(column: string): string {
  const titles: Record<string, string> = {
    date: "Date",
    amount: "Amount",
    currency: "Currency",
    recorded_by: "Recorded By",
    received_from: "Received From",
    income_type: "Income Type",
    description: "Description",
    used: "Used",
  };

  return (
    titles[column] ??
    column.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export default function TransactionHistory({
  onBack,
}: TransactionHistoryProps) {
  const {
    data: transactions,
    loading,
    error,
    refetch,
  } = getAllIncomeTransactions();

  const [selectedTransaction, setSelectedTransaction] =
    useState<IncomeTransactionType | null>(null);

  const transactionList = transactions ?? [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Transaction History
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Total transactions: {transactionList.length}
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-firstRate px-4 py-2 text-sm text-white transition hover:opacity-90"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <p className="py-8 text-center text-gray-500">
          Loading transaction history...
        </p>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-600">
            Failed to load transaction history. Please try again.
          </p>
          <p className="break-words text-sm text-red-500">{String(error)}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg bg-blue-firstRate px-4 py-2 text-sm text-white transition hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Transactions table */}
      {!loading && !error && (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full min-w-[650px] border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">
                  Currency
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">
                  Description
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {transactionList.length > 0 ? (
                transactionList.map((transaction, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 transition-colors hover:bg-blue-50"
                  >
                    <td className="whitespace-nowrap p-3 text-sm text-gray-700">
                      {formatValue(transaction.date)}
                    </td>
                    <td className="whitespace-nowrap p-3 text-sm text-gray-700">
                      {formatValue(transaction.amount)}
                    </td>
                    <td className="whitespace-nowrap p-3 text-sm text-gray-700">
                      {formatValue(transaction.currency)}
                    </td>
                    <td
                      className="max-w-xs truncate p-3 text-sm text-gray-700"
                      title={formatValue(transaction.description)}
                    >
                      {formatValue(transaction.description)}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => setSelectedTransaction(transaction)}
                        className="flex items-center gap-1 whitespace-nowrap rounded-md bg-blue-firstRate px-3 py-2 text-xs text-white transition hover:opacity-90"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-sm text-gray-500"
                  >
                    No transaction history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Transaction details modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Transaction Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Complete transaction information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                aria-label="Close details"
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 p-5">
              {Object.entries(selectedTransaction).map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-1 gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 sm:grid-cols-3"
                >
                  <p className="text-sm font-semibold text-gray-700">
                    {formatColumnTitle(key)}
                  </p>
                  <p className="break-words whitespace-pre-wrap text-sm text-gray-600 sm:col-span-2">
                    {formatValue(value)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t border-gray-100 p-5">
              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="rounded-lg bg-blue-firstRate px-5 py-2 text-sm text-white transition hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
