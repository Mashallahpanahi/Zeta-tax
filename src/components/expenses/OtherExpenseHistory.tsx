import type { OtherExpense } from "../../api/otherExpenseApi";
import { formatNumber } from "../../utils/formatNumber";

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
  // ✅ New Props for toggling
  isShowingAll: boolean;
  onToggleShowAll: () => void;
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
  isShowingAll,
  onToggleShowAll,
}: Props) {
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
          {isShowingAll
            ? "Showing all saved expenses."
            : "Showing expenses from the last 3 months. Only current-month expenses can be edited."}
        </p>
      </div>

      {loading && (
        <p className="py-4 text-sm text-gray-500">Loading other expenses...</p>
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
        <>
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
                          className={`rounded-lg px-3 py-1.5 text-sm text-white transition ${
                            canEdit
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
                      No other expenses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Total expenses displayed: {expenses.length}
            </p>

            {/* ✅ Show All Toggle Button */}
            <button
              type="button"
              onClick={onToggleShowAll}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              {isShowingAll
                ? "Show Only Recent (3 Months)"
                : "Show All Expenses"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
