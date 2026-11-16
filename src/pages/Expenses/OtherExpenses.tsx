import { useEffect, useState } from "react";
import {
  createOtherExpense,
  getOtherExpensesByMonth,
  getAllOtherExpenses,
  type CreateOtherExpenseType,
  type OtherExpense,
} from "../../api/otherExpenseApi";
import { getAllExpenseCategories } from "../../api/expenseCategoryApi";
import UpdateOtherExpenseModal from "../../components/expenses/UpdateOtherExpenseModal";
import OtherExpenseHistory from "../../components/expenses/OtherExpenseHistory";
import { formatNumber } from "../../utils/formatNumber";

const initialForm: CreateOtherExpenseType = {
  description: "",
  amount: 0,
  category_id: 0,
  currency: "AFN",
  expense_date: new Date().toISOString().slice(0, 10),
  note: "",
};

export default function OtherExpensesPage() {
  const [showHistory, setShowHistory] = useState(false);
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number | "all">(
    today.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [editExpense, setEditExpense] = useState<OtherExpense | null>(null);
  const [form, setForm] = useState<CreateOtherExpenseType>(initialForm);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  // formatting helper
  const formatInputValue = (value: string) => {
    const cleanValue = value.replace(/,/g, "").replace(/[^\d.]/g, "");
    const parts = cleanValue.split(".");
    const integerPart = parts[0];
    const decimalPart = parts.slice(1).join("");
    if (!integerPart && !cleanValue.includes(".")) return "";

    const formattedInteger = integerPart
      ? formatNumber(Number(integerPart))
      : "";

    return cleanValue.includes(".")
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };
  const [amountInput, setAmountInput] = useState("");
  // Fetch expenses for a specific month
  const {
    data: monthlyData,
    loading: monthlyLoading,
    error: monthlyError,
    refetch: refetchMonthly,
  } = getOtherExpensesByMonth(
    selectedMonth === "all" ? 1 : selectedMonth,
    selectedYear,
    showHistory && selectedMonth !== "all",
  );

  // Fetch all expenses when All Months is selected
  const {
    data: allExpensesData,
    loading: allLoading,
    error: allError,
    refetch: refetchAll,
  } = getAllOtherExpenses(showHistory && selectedMonth === "all");

  // Display expenses for the selected month or selected year
  const displayExpenses: OtherExpense[] =
    selectedMonth === "all"
      ? (allExpensesData ?? []).filter(
        (expense) =>
          Number(expense.expense_date.slice(0, 4)) === selectedYear,
      )
      : monthlyData?.expenses ?? [];

  // Calculate totals
  const totalAmount =
    selectedMonth === "all"
      ? displayExpenses.reduce(
        (total, expense) => total + Number(expense.amount),
        0,
      )
      : monthlyData?.total_amount ?? 0;

  const totalCount =
    selectedMonth === "all"
      ? displayExpenses.length
      : monthlyData?.count ?? 0;

  // Select the correct loading and error states
  const historyLoading =
    selectedMonth === "all" ? allLoading : monthlyLoading;

  const historyError =
    selectedMonth === "all" ? allError : monthlyError;

  const retryHistory =
    selectedMonth === "all" ? refetchAll : refetchMonthly;
  const {
    data: categoriesData,
    loading: loadingCategories,
    error: categoryError,
  } = getAllExpenseCategories();

  const { create, loading: saving, error: saveError } = createOtherExpense();

  const categories = categoriesData ?? [];

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 6000);
    return () => window.clearTimeout(timer);
  }, [message]);

  function handleChange(field: keyof CreateOtherExpenseType, value: string) {
    if (field === "amount") {
      const formattedValue = formatInputValue(value);

      setAmountInput(formattedValue);

      setForm((current) => ({
        ...current,
        amount: Number(formattedValue.replace(/,/g, "")) || 0,
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      [field]: field === "category_id" ? Number(value) : value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setMessage("");

    if (!form.description.trim()) {
      setFormError("Description is required.");
      return;
    }

    if (!Number.isFinite(form.amount) || form.amount <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }

    if (!form.category_id) {
      setFormError("Please select a category.");
      return;
    }

    const success = await create({
      ...form,
      description: form.description.trim(),
      currency: "AFN",
      note: form.note?.trim() || "",
    });

    if (success) {
      const expenseDate = form.expense_date.split("-").map(Number);

      setForm({
        ...initialForm,
        expense_date: new Date().toISOString().slice(0, 10),
      });
      setAmountInput("");

      setSelectedYear(expenseDate[0]);
      setSelectedMonth(expenseDate[1]);

      setFormError("");
      setMessage("Expense created successfully.");
      setShowHistory(true);
    }
  }

  function handleUpdateSuccess() {
    setEditExpense(null);
    setMessage("Expense updated successfully.");
    retryHistory();
  }

  return (
    <div className="space-y-4 p-4 sm:p-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setShowHistory((current) => !current);
            setEditExpense(null);
          }}
          className="rounded-lg bg-blue-firstRate px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-firstRate/90"
        >
          {showHistory ? "Back to Add Expense" : "View Expense History"}
        </button>
      </div>

      {!showHistory ? (
        <section className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h1 className="text-lg font-bold text-gray-900">Add New Expense</h1>
            <p className="mt-1 text-xs text-gray-500">
              Enter the details of your business expense.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="expense-description"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <input
                id="expense-description"
                required
                value={form.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-firstRate"
                placeholder="e.g. Bought office supplies"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="expense-amount"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Amount (AFN)
                </label>
                <input
                  id="expense-amount"
                  required
                  type="text"
                  inputMode="decimal"
                  value={amountInput}
                  onChange={(event) =>
                    handleChange("amount", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-firstRate"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label
                  htmlFor="expense-currency"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Currency
                </label>
                <input
                  id="expense-currency"
                  value="AFN"
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                />
              </div>

              <div>
                <label
                  htmlFor="expense-category"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  id="expense-category"
                  required
                  value={form.category_id || ""}
                  onChange={(event) =>
                    handleChange("category_id", event.target.value)
                  }
                  disabled={loadingCategories}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-firstRate disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select category"}
                  </option>
                  {categories
                    .filter((category) => category.status === "active")
                    .map((category) => (
                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.category_title}
                      </option>
                    ))}
                </select>
                {categoryError && (
                  <p role="alert" className="mt-1 text-xs text-red-600">
                    Could not load expense categories.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="expense-date"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Expense Date
                </label>
                <input
                  id="expense-date"
                  required
                  type="date"
                  value={form.expense_date}
                  onChange={(event) =>
                    handleChange("expense_date", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-firstRate"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="expense-note"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Note
              </label>
              <textarea
                id="expense-note"
                rows={2}
                value={form.note ?? ""}
                onChange={(event) => handleChange("note", event.target.value)}
                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-firstRate"
                placeholder="Optional note"
              />
            </div>

            {(formError || saveError) && (
              <p role="alert" className="text-sm text-red-600">
                {formError || saveError}
              </p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={saving || loadingCategories}
                className="rounded-lg bg-blue-firstRate px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-firstRate/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Expense"}
              </button>
            </div>
          </form>

          {message && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-white px-8 py-5 text-center shadow-xl"
              >
                <div className="mb-2 flex justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    ✓
                  </span>
                </div>

                <p className="text-base font-semibold text-green-700">
                  {message}
                </p>
              </div>
            </div>
          )}
        </section>
      ) : (
        <OtherExpenseHistory
          expenses={displayExpenses}
          categories={categories}
          loading={historyLoading}
          error={historyError}
          onRetry={retryHistory}
          onEdit={setEditExpense}
          month={selectedMonth}
          year={selectedYear}
          totalAmount={totalAmount}
          totalCount={totalCount}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
      )}
      <UpdateOtherExpenseModal
        expense={editExpense}
        onClose={() => setEditExpense(null)}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
}
