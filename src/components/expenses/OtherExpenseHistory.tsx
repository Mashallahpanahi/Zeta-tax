import type { OtherExpense } from "../../api/otherExpenseApi";
import { formatNumber } from "../../utils/formatNumber";
import Loader from "../common/Loader";

interface ExpenseCategory {
  category_id: string;
  category_title: string;
}

interface Props {
  expenses: OtherExpense[];
  categories: ExpenseCategory[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit: (expense: OtherExpense) => void;
  month: number | "all";
  year: number;
  totalAmount: number;
  totalCount: number;
  onMonthChange: (month: number | "all") => void;
  onYearChange: (year: number) => void;
}

function isCurrentMonth(date?: string): boolean {
  if (!date) return false;

  const [year, month] = date.slice(0, 10).split("-").map(Number);
  const today = new Date();
  return year === today.getFullYear() && month === today.getMonth() + 1;
}

export default function OtherExpenseHistory({
  expenses,
  categories,
  loading,
  error,
  onRetry,
  onEdit,
  month,
  year,
  totalAmount,
  totalCount,
  onMonthChange,
  onYearChange,
}: Props) {
  const currentYear = new Date().getFullYear();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function getCategoryName(expense: OtherExpense) {
    const category = categories.find(
      (item) => Number(item.category_id) === Number(expense.category_id),
    );

    return expense.category_title ?? category?.category_title ?? "—";
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Expense History</h1>
        <p className="mt-1 text-sm text-gray-500">
          View other expenses by selecting a month or all months of a year.
        </p>
      </div>

      {/* Month and Year Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="w-full sm:w-48">
          <label
            htmlFor="expense-history-month"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Select Month
          </label>

          <select
            id="expense-history-month"
            value={month}
            onChange={(event) =>
              onMonthChange(
                event.target.value === "all"
                  ? "all"
                  : Number(event.target.value)
              )
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-firstRate"
          >
            <option value="all">All Months</option>

            {months.map((monthName, index) => (
              <option key={monthName} value={index + 1}>
                {monthName}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-36">
          <label
            htmlFor="expense-history-year"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Select Year
          </label>

          <select
            id="expense-history-year"
            value={year}
            onChange={(event) => onYearChange(Number(event.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-firstRate"
          >
            {Array.from(
              { length: currentYear - 2020 + 1 },
              (_, index) => 2021 + index
            ).map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {formatNumber(Number(totalAmount))}
          </p>
          <p className="text-xs text-gray-500">AFN</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Number of Expenses</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {totalCount}
          </p>
          <p className="text-xs text-gray-500">
            {month === "all" ? `All Months of ${year}` : `${months[month - 1]} ${year}`}
          </p>
        </div>
      </div>

      {loading && (
        <Loader className="py-4 text-sm text-gray-500">
          Loading other expenses...
        </Loader>
      )}

      {error && (
        <div className="space-y-3 rounded-lg border border-red-200 p-4">
          <p role="alert" className="text-sm text-red-600">
            Error: {error}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-blue-firstRate px-4 py-2 text-sm text-white"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full min-w-[750px] border-collapse">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "ID",
                  "Description",
                  "Amount",
                  "Currency",
                  "Category",
                  "Expense Date",
                  "Note",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap p-3 text-left text-sm font-semibold text-gray-700"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {expenses.map((expense, index) => {
                const id = expense.id ?? expense.expense_id;
                const canEdit = isCurrentMonth(expense.expense_date);

                return (
                  <tr
                    key={id ?? index}
                    className="border-b border-gray-100 transition hover:bg-blue-50"
                  >
                    <td className="whitespace-nowrap p-3 text-sm">
                      {id ?? "—"}
                    </td>

                    <td className="p-3 text-sm">
                      {expense.description || "—"}
                    </td>

                    <td className="whitespace-nowrap p-3 text-sm">
                      {formatNumber(Number(expense.amount))}
                    </td>

                    <td className="whitespace-nowrap p-3 text-sm">
                      {expense.currency || "AFN"}
                    </td>

                    <td className="p-3 text-sm">
                      {getCategoryName(expense)}
                    </td>

                    <td className="whitespace-nowrap p-3 text-sm">
                      {expense.expense_date?.slice(0, 10) || "—"}
                    </td>

                    <td className="max-w-[220px] p-3 text-sm">
                      {expense.note || "—"}
                    </td>

                    <td className="whitespace-nowrap p-3">
                      <button
                        type="button"
                        onClick={() => onEdit(expense)}
                        disabled={!canEdit}
                        title={
                          canEdit
                            ? "Edit expense"
                            : "Only current-month expenses can be edited"
                        }
                        className={`rounded-lg px-3 py-1.5 text-sm text-white transition ${canEdit
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "cursor-not-allowed bg-gray-400 opacity-60"
                          }`}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}

              {expenses.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-6 text-center text-sm text-gray-500"
                  >
                    No other expenses found for{" "}
                    {month === "all" ? `any month of ${year}` : `${months[month - 1]} ${year}`}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && (
        <p className="text-sm text-gray-500">
          Showing {expenses.length} expense records.
        </p>
      )}
    </section>
  );
}