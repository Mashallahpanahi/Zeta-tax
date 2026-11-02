import { useEffect, useState } from "react";
import { formatNumber } from "../../utils/formatNumber";
import {
  getAllIncomeTransactions,
  getRecentIncomeTransactions,
  type IncomeTransactionType,
} from "../../api/incomeTransactionApi";
import AddIncomeModal from "../../components/income/AddIncomeModal";
import EditIncomeModal from "../../components/income/EditIncomeModal";
import ViewIncomeModal from "../../components/income/ViewIncomeModal";

// ✅ Import the Financial Summary component
import FinancialSummary from "../../components/report/FinancialSummary";


function isCurrentMonth(date: IncomeTransactionType["date"]): boolean {
  const [year, month] = String(date)
    .slice(0, 10)
    .split("-")
    .map(Number);

  const today = new Date();

  return (
    year === today.getFullYear() &&
    month === today.getMonth() + 1
  );
}
export default function IncomeTransactionPage() {
  // Toggle state: false = last 3 months, true = all data
  const [showAll, setShowAll] = useState(false);

  // Hook 1: Fetch recent (default)
  const {
    data: recentData,
    message: recentMsg,
    loading: recentLoading,
    error: recentError,
    refetch: refetchRecent,
  } = getRecentIncomeTransactions();

  // Hook 2: Fetch all
  const {
    data: allData,
    message: allMsg,
    loading: allLoading,
    error: allError,
    refetch: refetchAll,
  } = getAllIncomeTransactions();

  const [visibleMessage, setVisibleMessage] = useState<string | null>(null);

  // Modal States
  const [selectedTransaction, setSelectedTransaction] =
    useState<IncomeTransactionType | null>(null);
  const [editTransaction, setEditTransaction] =
    useState<IncomeTransactionType | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Determine active data based on toggle
  const activeMessage = showAll ? allMsg : recentMsg;
  const loading = showAll ? allLoading : recentLoading;
  const error = showAll ? allError : recentError;
  const activeRefetch = showAll ? refetchAll : refetchRecent;

  // Flatten the grouped 3-month data into a single array of transactions
  const transactionList = showAll
    ? (allData ?? [])
    : (recentData?.flatMap((monthGroup) => monthGroup.data) ?? []);

  // Auto-hide backend message
  useEffect(() => {
    if (!activeMessage) return;
    setVisibleMessage(activeMessage);
    const timer = window.setTimeout(() => setVisibleMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [activeMessage]);

  const columns = ["date", "amount", "currency", "description"];

  if (loading) return <p className="p-6">Loading income transactions...</p>;

  if (error) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={() => void activeRefetch()}
          className="rounded-lg bg-blue-firstRate px-4 py-2 text-white hover:!bg-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* ✅ Financial Summary at the top of the page */}
      <FinancialSummary />

      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {showAll ? "All Received Income" : "Recent Income (Last 3 Months)"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Showing {transactionList.length} transaction
            {transactionList.length !== 1 && "s"}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
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

      {/* Table */}
      <div className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full table-fixed border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="p-3 text-left text-xs font-semibold text-gray-700 sm:text-sm"
                >
                  {column.charAt(0).toUpperCase() + column.slice(1)}
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
                const id = transaction.income_id ?? transaction.id ?? index;
                const canEdit = isCurrentMonth(transaction.date);
                return (
                  <tr
                    key={id}
                    className="border-b border-gray-100 transition-colors hover:bg-blue-50"
                  >
                    {columns.map((column) => (
                      <td
                        key={column}
                        className="overflow-hidden text-ellipsis whitespace-nowrap p-3 text-xs sm:text-sm"
                      >
                        {column === "amount"
                          ? formatNumber(Number(transaction[column]))
                          : String(transaction[column] ?? "-")}
                      </td>
                    ))}
                    <td className="p-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="rounded-md bg-blue-firstRate px-2 py-1 text-xs text-white transition hover:!bg-blue-500"
                        >
                          Show More
                        </button>
                        <button
                          onClick={() => setEditTransaction(transaction)}
                          disabled={!canEdit}
                          title={
                            canEdit
                              ? "Edit transaction"
                              : "You can only edit transactions from the current month"
                          }
                          className={`rounded-md px-2 py-1 text-xs text-white transition ${canEdit
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : "cursor-not-allowed bg-gray-400 opacity-60"
                            }`}
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

      {/* Show All Button at the bottom */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          {showAll ? "Show Only Recent (3 Months)" : "Show All Transactions"}
        </button>
      </div>

      {/* Modals */}
      <AddIncomeModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={activeRefetch}
      />
      <EditIncomeModal
        isOpen={!!editTransaction}
        transaction={editTransaction}
        onClose={() => setEditTransaction(null)}
        onSuccess={activeRefetch}
      />
      <ViewIncomeModal
        isOpen={!!selectedTransaction}
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
