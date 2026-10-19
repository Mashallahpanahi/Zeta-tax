import { useEffect, useState } from "react";
import { formatNumber } from "../../utils/formatNumber";
import {
  getAllIncomeTransactions,
  updateIncomeTransaction,
  type IncomeTransactionType,
} from "../../api/incomeTransactionApi";
import TransactionHistory from "./TransactionHistory";

const BASE_URL = "http://localhost:3001";

type NewIncomeForm = {
  date: string;
  amount: string;
  currency: string;
  recorded_by: string;
  received_from: string;
  income_type: string;
  description: string;
};

const createEmptyForm = (): NewIncomeForm => ({
  date: new Date().toISOString().slice(0, 10),
  amount: "",
  currency: "USD",
  recorded_by: "",
  received_from: "",
  income_type: "Monthly",
  description: "",
});

function getTransactionId(transaction: IncomeTransactionType) {
  const id =
    transaction.income_id ??
    transaction.id ??
    transaction.transaction_id ??
    transaction._id;

  if (typeof id === "string" || typeof id === "number") {
    return String(id);
  }

  return null;
}

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

export default function IncomeTransactionPage() {
  const {
    data: transactions,
    message,
    loading,
    error,
    refetch,
  } = getAllIncomeTransactions();

  const {
    update,
    loading: updating,
    error: updateError,
  } = updateIncomeTransaction();

  const [selectedTransaction, setSelectedTransaction] =
    useState<IncomeTransactionType | null>(null);

  const [editTransaction, setEditTransaction] =
    useState<IncomeTransactionType | null>(null);

  const [editForm, setEditForm] = useState({
    date: "",
    amount: "",
    currency: "USD",
    description: "",
  });

  const [visibleMessage, setVisibleMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [adding, setAdding] = useState(false);

  const [newTransaction, setNewTransaction] =
    useState<NewIncomeForm>(createEmptyForm);

  useEffect(() => {
    if (!message) return;

    setVisibleMessage(message);

    const timer = setTimeout(() => {
      setVisibleMessage(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [message]);

  const transactionList = transactions ?? [];

  const preferredColumns = ["date", "amount", "currency", "description"];

  const columns = preferredColumns;

  const openEdit = (transaction: IncomeTransactionType) => {
    setEditTransaction(transaction);

    setEditForm({
      date: String(transaction.date ?? "").slice(0, 10),
      amount: String(transaction.amount ?? ""),
      currency: String(transaction.currency ?? "USD"),
      description: String(transaction.description ?? ""),
    });

    setLocalError("");
  };

  const handleUpdate = async () => {
    if (!editTransaction) return;

    const id = getTransactionId(editTransaction);

    if (!id) {
      setLocalError("Transaction ID was not found.");
      return;
    }

    if (!editForm.date) {
      setLocalError("Please select a date.");
      return;
    }

    if (
      editForm.amount.trim() === "" ||
      !Number.isFinite(Number(editForm.amount)) ||
      Number(editForm.amount) <= 0
    ) {
      setLocalError("Please enter an amount greater than zero.");
      return;
    }

    try {
      setLocalError("");

      const payload: Record<string, unknown> = {
        ...editTransaction,
        date: editForm.date,
        amount: Number(editForm.amount),
        currency: editForm.currency,
        description: editForm.description.trim(),
      };

      delete payload.id;
      delete payload.income_id;
      delete payload.transaction_id;
      delete payload._id;
      delete payload.created_at;
      delete payload.updated_at;

      const success = await update(id, payload);

      if (success) {
        setEditTransaction(null);
        setVisibleMessage("Transaction updated successfully.");
        await refetch();
      }
    } catch (err) {
      setLocalError(
        err instanceof Error
          ? err.message
          : "Unable to update the transaction.",
      );
    }
  };

  const handleAddTransaction = async () => {
    setLocalError("");

    if (!newTransaction.date) {
      setLocalError("Please select a date.");
      return;
    }

    if (
      newTransaction.amount.trim() === "" ||
      !Number.isFinite(Number(newTransaction.amount)) ||
      Number(newTransaction.amount) <= 0
    ) {
      setLocalError("Please enter an amount greater than zero.");
      return;
    }

    if (!newTransaction.recorded_by.trim()) {
      setLocalError("Please enter Recorded By.");
      return;
    }

    if (!newTransaction.received_from.trim()) {
      setLocalError("Please enter Received From.");
      return;
    }

    if (!newTransaction.income_type) {
      setLocalError("Please select an income type.");
      return;
    }

    const payload = {
      date: newTransaction.date,
      amount: Number(newTransaction.amount),
      currency: newTransaction.currency,
      recorded_by: newTransaction.recorded_by.trim(),
      received_from: newTransaction.received_from.trim(),
      income_type: newTransaction.income_type,
      description: newTransaction.description.trim(),
    };

    try {
      setAdding(true);

      const response = await fetch(`${BASE_URL}/transaction-receive-income`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        let errorMessage = responseText;

        try {
          const errorData: unknown = JSON.parse(responseText);

          if (
            errorData !== null &&
            typeof errorData === "object" &&
            "message" in errorData
          ) {
            const apiMessage = errorData.message;

            errorMessage = Array.isArray(apiMessage)
              ? apiMessage.join(", ")
              : String(apiMessage);
          }
        } catch {
          // Keep the original response text.
        }

        throw new Error(
          errorMessage || `Failed to create transaction (${response.status})`,
        );
      }

      setShowAddForm(false);
      setNewTransaction(createEmptyForm());
      setVisibleMessage("Transaction added successfully.");

      await refetch();
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Failed to add transaction.",
      );
    } finally {
      setAdding(false);
    }
  };

  // Show the separate TransactionHistory component.
  if (showHistory) {
    return <TransactionHistory onBack={() => setShowHistory(false)} />;
  }

  if (loading) {
    return <p className="p-6">Loading income transactions...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-red-500">Error: {error}</p>

        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg bg-blue-firstRate px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page header and action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Income Transactions</h1>

          <p className="mt-1 text-sm text-gray-500">
            Total transactions: {transactionList.length}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="whitespace-nowrap rounded-lg bg-blue-firstRate px-4 py-2 text-sm text-white transition hover:!bg-blue-500"
          >
            History
          </button>

          <button
            type="button"
            onClick={() => {
              setLocalError("");
              setNewTransaction(createEmptyForm());
              setShowAddForm(true);
            }}
            className="whitespace-nowrap rounded-lg bg-blue-firstRate px-4 py-2 text-sm text-white transition hover:!bg-blue-500"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {visibleMessage && (
        <p className="text-sm text-green-600">{visibleMessage}</p>
      )}

      {updateError && (
        <p className="text-sm text-red-500">Update: {updateError}</p>
      )}

      {localError && !editTransaction && !showAddForm && (
        <p className="text-sm text-red-500">{localError}</p>
      )}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full min-w-[600px] table-fixed border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="break-words p-3 text-left text-sm font-semibold text-gray-700"
                >
                  {formatColumnTitle(column)}
                </th>
              ))}

              <th className="w-44 p-2 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {transactionList.length > 0 ? (
              transactionList.map((transaction, index) => {
                const id = getTransactionId(transaction);

                return (
                  <tr
                    key={id ?? index}
                    className="border-b border-gray-100 transition-colors hover:bg-blue-50"
                  >
                    {columns.map((column) => (
                      <td
                        key={column}
                        className="overflow-hidden text-ellipsis whitespace-nowrap p-3 text-sm"
                        title={formatValue(transaction[column])}
                      >
                        {column === "amount"
                          ? formatNumber(Number(transaction.amount))
                          : formatValue(transaction[column])}
                      </td>
                    ))}

                    <td className="p-2">
                      <div className="flex flex-nowrap items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedTransaction(transaction)}
                          className="whitespace-nowrap rounded-md bg-blue-firstRate px-2 py-1 text-xs text-white transition-colors hover:!bg-blue-500"
                        >
                          Show More
                        </button>

                        <button
                          type="button"
                          onClick={() => openEdit(transaction)}
                          className="whitespace-nowrap rounded-md bg-yellow-500 px-2 py-1 text-xs text-white transition-colors hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="p-6 text-center text-gray-500"
                >
                  No income transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-bold">Add Income Transaction</h2>

            <p className="mb-5 text-sm text-gray-500">
              Enter the details of the new income transaction.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleAddTransaction();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Date
                  </label>

                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(event) =>
                      setNewTransaction((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Amount
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(event) =>
                      setNewTransaction((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="Enter amount"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Currency
                  </label>

                  <select
                    value={newTransaction.currency}
                    onChange={(event) =>
                      setNewTransaction((current) => ({
                        ...current,
                        currency: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="AFN">AFN</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Recorded By
                  </label>

                  <input
                    type="text"
                    value={newTransaction.recorded_by}
                    onChange={(event) =>
                      setNewTransaction((current) => ({
                        ...current,
                        recorded_by: event.target.value,
                      }))
                    }
                    placeholder="Enter name"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Received From
                  </label>

                  <input
                    type="text"
                    value={newTransaction.received_from}
                    onChange={(event) =>
                      setNewTransaction((current) => ({
                        ...current,
                        received_from: event.target.value,
                      }))
                    }
                    placeholder="Enter client or source"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Income Type
                  </label>

                  <select
                    value={newTransaction.income_type}
                    onChange={(event) =>
                      setNewTransaction((current) => ({
                        ...current,
                        income_type: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Salary">Salary</option>
                    <option value="Project">Project</option>
                    <option value="Sales">Sales</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  value={newTransaction.description}
                  onChange={(event) =>
                    setNewTransaction((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Enter transaction description"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {localError && (
                <p className="whitespace-pre-wrap text-sm text-red-500">
                  {localError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setLocalError("");
                  }}
                  disabled={adding}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adding}
                  className="rounded-lg bg-blue-firstRate px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show More modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Transaction Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  View income transaction information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                aria-label="Close transaction details"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-xl font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                ×
              </button>
            </div>

            <div className="max-h-[calc(85vh-90px)] overflow-y-auto p-6">
              <div className="space-y-3">
                {Object.entries(selectedTransaction)
                  .filter(
                    ([key]) =>
                      ![
                        "income_id",
                        "id",
                        "transaction_id",
                        "_id",
                        "created_at",
                        "updated_at",
                      ].includes(key),
                  )
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-1 gap-2 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-4 transition hover:border-blue-100 hover:bg-blue-50/50 sm:grid-cols-3 sm:items-start sm:gap-4"
                    >
                      <p className="text-sm font-bold text-gray-800">
                        {formatColumnTitle(key)}
                      </p>

                      <p className="break-words text-sm font-medium leading-6 text-gray-600 sm:col-span-2">
                        {formatValue(value)}
                      </p>
                    </div>
                  ))}
              </div>

              <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedTransaction(null)}
                  className="rounded-lg bg-blue-firstRate px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction modal */}
      {editTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-bold">Edit Income Transaction</h2>

            <p className="mb-5 text-sm text-gray-500">
              Update the transaction details using the fields below.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date
                </label>

                <input
                  type="date"
                  value={editForm.date}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Amount
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Currency
                </label>

                <select
                  value={editForm.currency}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      currency: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="AFN">AFN</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Enter transaction description"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {(localError || updateError) && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-red-500">
                {localError || updateError}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditTransaction(null);
                  setLocalError("");
                }}
                disabled={updating}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleUpdate()}
                disabled={updating}
                className="rounded-lg bg-blue-firstRate px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
