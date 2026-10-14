import { useEffect, useState } from "react";
import {
  getAllIncomeTransactions,
  updateIncomeTransaction,
  deleteIncomeTransaction,
  type IncomeTransactionType,
} from "../../api/incomeTransactionApi";

const BASE_URL = "http://localhost:3001";

type ExchangeRecord = {
  amount_af?: string | number;
  received_income_transaction_id?: string | number;
  received_income_transaction?: {
    income_id?: string | number;
  };
};

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

function getIncomeId(transaction: IncomeTransactionType) {
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
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function formatAFN(value: string | number): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "-";
  }

  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} AFN`;
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

  const [editJson, setEditJson] = useState("");
  const [visibleMessage, setVisibleMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [convertedAmounts, setConvertedAmounts] = useState<
    Record<string, string>
  >({});

  const [showAddForm, setShowAddForm] = useState(false);
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

  useEffect(() => {
    let cancelled = false;

    const fetchConvertedAmounts = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/cash-balance-exchanged-to-af`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch converted AFN amounts.");
        }

        const result: unknown = await response.json();

        if (
          result === null ||
          typeof result !== "object" ||
          !("data" in result) ||
          !Array.isArray(result.data)
        ) {
          throw new Error("Invalid exchange API response.");
        }

        const amounts: Record<string, string> = {};

        for (const item of result.data) {
          if (item === null || typeof item !== "object") {
            continue;
          }

          const exchange = item as ExchangeRecord;

          const incomeId =
            exchange.received_income_transaction_id ??
            exchange.received_income_transaction?.income_id;

          if (
            incomeId !== undefined &&
            incomeId !== null &&
            exchange.amount_af !== undefined &&
            exchange.amount_af !== null
          ) {
            amounts[String(incomeId)] = formatAFN(exchange.amount_af);
          }
        }

        if (!cancelled) {
          setConvertedAmounts(amounts);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load converted AFN amounts:", err);
        }
      }
    };

    void fetchConvertedAmounts();

    return () => {
      cancelled = true;
    };
  }, []);

  const transactionList = transactions ?? [];

  const preferredColumns = [
    "income_id",
    "date",
    "amount",
    "currency",
    "recorded_by",
    "received_from",
    "income_type",
    "description",
  ];

  const columns =
    transactionList.length > 0
      ? preferredColumns.filter((column) =>
          Object.keys(transactionList[0]).includes(column),
        )
      : [];

  const openEdit = (transaction: IncomeTransactionType) => {
    setEditTransaction(transaction);
    setEditJson(JSON.stringify(transaction, null, 2));
    setLocalError("");
  };

  const handleUpdate = async () => {
    if (!editTransaction) return;

    const id = getTransactionId(editTransaction);

    if (!id) {
      setLocalError("Transaction ID was not found.");
      return;
    }

    try {
      setLocalError("");

      const parsed: unknown = JSON.parse(editJson);

      if (
        parsed === null ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        setLocalError("Please enter a valid JSON object.");
        return;
      }

      const payload = {
        ...(parsed as Record<string, unknown>),
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
            const message = errorData.message;

            errorMessage = Array.isArray(message)
              ? message.join(", ")
              : String(message);
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

  const handleDelete = async (transaction: IncomeTransactionType) => {
    const id = getTransactionId(transaction);

    if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
      setLocalError("A valid numeric transaction ID was not found.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this income transaction?",
    );

    if (!confirmed) return;

    try {
      setLocalError("");
      setDeletingId(id);

      await deleteIncomeTransaction(Number(id));

      setVisibleMessage("Transaction deleted successfully.");

      if (selectedTransaction && getTransactionId(selectedTransaction) === id) {
        setSelectedTransaction(null);
      }

      if (editTransaction && getTransactionId(editTransaction) === id) {
        setEditTransaction(null);
      }

      await refetch();
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Failed to delete transaction.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p className="p-6">Loading income transactions...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-red-500">Error: {error}</p>

        <button
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Income Transactions</h1>

          <p className="mt-1 text-sm text-gray-500">
            Total transactions: {transactionList.length}
          </p>
        </div>

        <button
          onClick={() => {
            setLocalError("");
            setNewTransaction(createEmptyForm());
            setShowAddForm(true);
          }}
          className="whitespace-nowrap rounded-lg bg-blue-firstRate px-4 py-2 text-sm text-white transition hover:opacity-90"
        >
          + Add Transaction
        </button>
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

      {/* Transactions table */}
      <div className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full table-fixed border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="break-words p-3 text-left text-sm font-semibold text-gray-700"
                >
                  {column.replace(/_/g, " ")}
                </th>
              ))}

              <th className="p-3 text-left text-sm font-semibold text-gray-700">
                Converted AFN
              </th>

              <th className="w-56 p-2 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {transactionList.length > 0 ? (
              transactionList.map((transaction, index) => {
                const id = getTransactionId(transaction);
                const incomeId = getIncomeId(transaction);

                return (
                  <tr
                    key={incomeId ?? id ?? index}
                    className="border-b border-gray-100 transition hover:bg-blue-50"
                  >
                    {columns.map((column) => (
                      <td
                        key={column}
                        className="overflow-hidden text-ellipsis whitespace-nowrap p-3 text-sm"
                        title={formatValue(transaction[column])}
                      >
                        {formatValue(transaction[column])}
                      </td>
                    ))}

                    <td className="overflow-hidden text-ellipsis whitespace-nowrap p-3 text-sm">
                      {incomeId ? (convertedAmounts[incomeId] ?? "-") : "-"}
                    </td>

                    <td className="p-2">
                      <div className="flex flex-nowrap items-center gap-1">
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="whitespace-nowrap rounded-md bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                        >
                          Show More
                        </button>

                        <button
                          onClick={() => openEdit(transaction)}
                          className="whitespace-nowrap rounded-md bg-yellow-500 px-2 py-1 text-xs text-white hover:bg-yellow-600"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => void handleDelete(transaction)}
                          disabled={deletingId === id}
                          className="whitespace-nowrap rounded-md bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="p-6 text-center text-gray-500"
                >
                  No income transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Transaction modal */}
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
                    <option value="EUR">EUR</option>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Transaction Details</h2>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(selectedTransaction).map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-1 gap-1 border-b border-gray-100 pb-3 sm:grid-cols-3"
                >
                  <p className="text-sm font-semibold capitalize text-gray-600">
                    {key.replace(/_/g, " ")}
                  </p>

                  <p className="break-words text-sm sm:col-span-2">
                    {formatValue(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-bold">Edit Income Transaction</h2>

            <p className="mb-4 text-sm text-gray-500">
              Edit the transaction fields in JSON format.
            </p>

            <textarea
              value={editJson}
              onChange={(event) => setEditJson(event.target.value)}
              rows={12}
              spellCheck={false}
              className="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm outline-none focus:border-blue-500"
            />

            {(localError || updateError) && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-red-500">
                {localError || updateError}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-3">
              <button
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
