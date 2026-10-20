// programmer Negin Mohamadi 2026/10/20

import { useEffect, useState } from "react";
import { formatNumber } from "../../utils/formatNumber";
import {
  getAllIncomeTransactions,
  updateIncomeTransaction,
  type IncomeTransactionType,
} from "../../api/incomeTransactionApi";

const BASE_URL = "http://localhost:3001";

type IncomeForm = {
  date: string;
  amount: string;
  currency: string;
  recorded_by: string;
  received_from: string;
  income_type: string;
  description: string;
};

type EditForm = IncomeForm;

const createEmptyForm = (): IncomeForm => ({
  date: new Date().toISOString().slice(0, 10),
  amount: "",
  currency: "USD",
  recorded_by: "",
  received_from: "",
  income_type: "Monthly",
  description: "",
});

const DETAIL_FIELDS = [
  ["date", "Date"],
  ["amount", "Amount"],
  ["currency", "Currency"],
  ["recorded_by", "Recorded By"],
  ["received_from", "Received From"],
  ["income_type", "Income Type"],
  ["description", "Description"],
  ["used", "Used"],
] as const;

function getTransactionId(transaction: IncomeTransactionType): string | null {
  const id =
    transaction.income_id ??
    transaction.id ??
    transaction.transaction_id ??
    transaction._id;

  return typeof id === "string" || typeof id === "number" ? String(id) : null;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatAmount(value: unknown): string {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(Number(value))
  ) {
    return "-";
  }

  return formatNumber(Number(value));
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

function fieldClass() {
  return "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
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

  const [editForm, setEditForm] = useState<EditForm>(createEmptyForm);

  const [visibleMessage, setVisibleMessage] = useState<string | null>(null);

  const [localError, setLocalError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);

  const [newTransaction, setNewTransaction] =
    useState<IncomeForm>(createEmptyForm);

  useEffect(() => {
    if (!message) return;

    setVisibleMessage(message);

    const timer = window.setTimeout(() => setVisibleMessage(null), 5000);

    return () => window.clearTimeout(timer);
  }, [message]);

  const transactionList = transactions ?? [];
  const columns = ["date", "amount", "currency", "description"];

  const openEdit = (transaction: IncomeTransactionType) => {
    setEditTransaction(transaction);

    setEditForm({
      date: String(transaction.date ?? "").slice(0, 10),
      amount: String(transaction.amount ?? ""),
      currency: String(transaction.currency ?? "USD"),
      recorded_by: String(transaction.recorded_by ?? ""),
      received_from: String(transaction.received_from ?? ""),
      income_type: String(transaction.income_type ?? "Monthly"),
      description: String(transaction.description ?? ""),
    });

    setLocalError("");
  };

  const validateForm = (form: IncomeForm): string => {
    if (!form.date) {
      return "Please select a date.";
    }

    if (
      form.amount.trim() === "" ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      return "Please enter an amount greater than zero.";
    }

    if (!form.currency) {
      return "Please select a currency.";
    }

    if (!form.recorded_by.trim()) {
      return "Please enter Recorded By.";
    }

    if (!form.received_from.trim()) {
      return "Please enter Received From.";
    }

    if (!form.income_type) {
      return "Please select an income type.";
    }

    return "";
  };

  const handleUpdate = async () => {
    if (!editTransaction) return;

    const id = getTransactionId(editTransaction);

    if (!id) {
      setLocalError("Transaction ID was not found.");
      return;
    }

    const validationError = validateForm(editForm);

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      setLocalError("");

      const payload: Record<string, unknown> = {
        ...editTransaction,
        date: editForm.date,
        amount: Number(editForm.amount),
        currency: editForm.currency,
        recorded_by: editForm.recorded_by.trim(),
        received_from: editForm.received_from.trim(),
        income_type: editForm.income_type,
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

    const validationError = validateForm(newTransaction);

    if (validationError) {
      setLocalError(validationError);
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

  const updateNewField = (field: keyof IncomeForm, value: string) => {
    setNewTransaction((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateEditField = (field: keyof EditForm, value: string) => {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const renderFormFields = (
    form: IncomeForm,
    onChange: (field: keyof IncomeForm, value: string) => void,
  ) => (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date
          </label>

          <input
            type="date"
            value={form.date}
            onChange={(event) => onChange("date", event.target.value)}
            required
            className={fieldClass()}
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
            value={form.amount}
            onChange={(event) => onChange("amount", event.target.value)}
            placeholder="Enter amount"
            required
            className={fieldClass()}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Currency
          </label>

          <select
            value={form.currency}
            onChange={(event) => onChange("currency", event.target.value)}
            required
            className={fieldClass()}
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
            value={form.recorded_by}
            onChange={(event) => onChange("recorded_by", event.target.value)}
            placeholder="Enter name"
            required
            className={fieldClass()}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Received From
          </label>

          <input
            type="text"
            value={form.received_from}
            onChange={(event) => onChange("received_from", event.target.value)}
            placeholder="Enter client or source"
            required
            className={fieldClass()}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Income Type
          </label>

          <select
            value={form.income_type}
            onChange={(event) => onChange("income_type", event.target.value)}
            required
            className={fieldClass()}
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
          value={form.description}
          onChange={(event) => onChange("description", event.target.value)}
          rows={3}
          placeholder="Enter transaction description"
          className={fieldClass()}
        />
      </div>
    </>
  );

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
          className="rounded-lg bg-blue-firstRate px-4 py-2 text-white transition hover:!bg-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            List of Received Income
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Total transactions: {transactionList.length}
          </p>
        </div>

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

      {visibleMessage && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {visibleMessage}
        </p>
      )}

      {updateError && (
        <p className="text-sm text-red-500">Update: {updateError}</p>
      )}

      {localError && !editTransaction && !showAddForm && (
        <p className="text-sm text-red-500">{localError}</p>
      )}

      <div className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full table-fixed border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="break-words p-3 text-left text-xs font-semibold text-gray-700 sm:text-sm"
                >
                  {formatColumnTitle(column)}
                </th>
              ))}

              <th className="w-32 p-2 text-left text-xs font-semibold text-gray-700 sm:w-44 sm:text-sm">
                Action
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
                        className="overflow-hidden text-ellipsis whitespace-nowrap p-3 text-xs sm:text-sm"
                        title={
                          column === "amount"
                            ? formatAmount(transaction.amount)
                            : formatValue(transaction[column])
                        }
                      >
                        {column === "amount"
                          ? formatAmount(transaction.amount)
                          : formatValue(transaction[column])}
                      </td>
                    ))}

                    <td className="p-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedTransaction(transaction)}
                          className="rounded-md bg-blue-firstRate px-2 py-1 text-xs text-white transition hover:!bg-blue-500"
                        >
                          Show More
                        </button>

                        <button
                          type="button"
                          onClick={() => openEdit(transaction)}
                          className="rounded-md bg-yellow-500 px-2 py-1 text-xs text-white transition hover:bg-yellow-600"
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

      {/* Add Transaction modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
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
              {renderFormFields(newTransaction, updateNewField)}

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
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adding}
                  className="rounded-lg bg-blue-firstRate px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-50"
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
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4 sm:px-6">
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

            <div className="max-h-[calc(85vh-90px)] overflow-y-auto p-5 sm:p-6">
              <div className="space-y-4">
                {DETAIL_FIELDS.map(([key, label]) => (
                  <div
                    key={key}
                    className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-4"
                  >
                    <p className="text-sm font-semibold text-gray-800">
                      {label}
                    </p>

                    <p className="break-words text-sm leading-6 text-gray-600 sm:col-span-2">
                      {key === "amount"
                        ? formatAmount(selectedTransaction[key])
                        : formatValue(selectedTransaction[key])}
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
            <h2 className="mb-2 text-lg font-bold">Edit Income Transaction</h2>

            <p className="mb-5 text-sm text-gray-500">
              Update the transaction details using the fields below.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleUpdate();
              }}
              className="space-y-4"
            >
              {renderFormFields(editForm, updateEditField)}

              {(localError || updateError) && (
                <p className="whitespace-pre-wrap text-sm text-red-500">
                  {localError || updateError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditTransaction(null);
                    setLocalError("");
                  }}
                  disabled={updating}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-blue-firstRate px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
