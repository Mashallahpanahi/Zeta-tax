import { useMemo, useState } from "react";

import { getAllIncomeTransactions } from "../../api/incomeTransactionApi";
import {
  createCashBalanceExchange,
  getAllCashBalanceExchanges,
  getRecentCashBalanceExchanges,
} from "../../api/cashBalanceExchangeApi";

// ✅ Import the API to get the exact unallocated amount
import { useUnallocatedYearly } from "../..//api/reportApi";

import ExchangeFormModal from "../../components/income/ExchangeFormModal";
import { formatNumber } from "../../utils/formatNumber";
import FinancialSummary from "../../components/report/FinancialSummary";

const formatFriendlyDate = (dateValue: string): string => {
  if (!dateValue) return "—";
  const date = new Date(`${dateValue.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function ExchangeToAFNPage() {
  // Toggle State: false = 3 months, true = all
  const [showAll, setShowAll] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  // Income (Needed for modal logic)
  const { data: incomesData, refetch: refetchIncomes } =
    getAllIncomeTransactions();
  const incomes = incomesData ?? [];

  // 1. Fetch Recent (Default)
  const { data: recentData, refetch: refetchRecent } =
    getRecentCashBalanceExchanges();

  // 2. Fetch All
  const { data: allData, refetch: refetchAll } = getAllCashBalanceExchanges();

  const { create: createExchange } = createCashBalanceExchange();

  // 3. ✅ Fetch the EXACT unallocated amount from the backend
  // We use the current year because the modal restricts dates to the current month
  const currentYear = new Date().getFullYear();
  const { data: yearlyData, refetch: refetchYearly } =
    useUnallocatedYearly(currentYear);

  // This is the exact amount to pass to the modal (e.g., 37,089.5)
  const exactUnallocatedUSD = yearlyData?.unallocated_usd ?? 0;

  // Determine which data to use based on toggle
  const activeRefetch = showAll ? refetchAll : refetchRecent;
  const allExchanges = allData ?? [];

  // Flatten the 3-month data into a single array
  const recentExchanges = recentData?.flatMap((group) => group.data) ?? [];

  // The list currently being displayed
  const activeExchanges = showAll ? allExchanges : recentExchanges;

  // Sort the active exchanges by date descending
  const sortedExchanges = useMemo(
    () =>
      [...activeExchanges].sort((a, b) =>
        String(b.date_of_exchange ?? "").localeCompare(
          String(a.date_of_exchange ?? ""),
        ),
      ),
    [activeExchanges],
  );

  // Filter by selected month
  const displayedExchanges = useMemo(() => {
    if (selectedMonth === "all") return sortedExchanges;
    return sortedExchanges.filter(
      (exchange) =>
        String(exchange.date_of_exchange ?? "").slice(0, 7) === selectedMonth,
    );
  }, [selectedMonth, sortedExchanges]);

  // Total AFN & USD of the currently displayed (filtered) list
  const totalAFN = useMemo(
    () =>
      displayedExchanges.reduce(
        (total, exchange) => total + Number(exchange.amount_af ?? 0),
        0,
      ),
    [displayedExchanges],
  );

  const totalUSD = useMemo(
    () =>
      displayedExchanges.reduce((total, exchange) => {
        const rate = Number(exchange.ex_rate ?? 0);
        if (rate <= 0) return total;
        return total + Number(exchange.amount_af ?? 0) / rate;
      }, 0),
    [displayedExchanges],
  );

  // Extract available months for the dropdown based on the active list
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    for (const exchange of activeExchanges) {
      const month = String(exchange.date_of_exchange ?? "").slice(0, 7);
      if (month) months.add(month);
    }
    return [...months].sort((a, b) => b.localeCompare(a));
  }, [activeExchanges]);

  const handleExchangeCreated = () => {
    setIsModalOpen(false);
    setMessage("Exchange saved successfully.");

    // ✅ Refetch all data including the exact unallocated amount
    activeRefetch();
    refetchIncomes();
    refetchYearly();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* ✅ Financial Summary at the top of the page */}
      <FinancialSummary />

      {/* Top Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Monthly Invoice Allocation
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review your monthly currency allocations, exchange rates, and the AFN
            received from each USD exchange.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-blue-firstRate px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Allocate new amount +
        </button>
      </div>

      {message && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage("")}
            className="ml-3 font-semibold"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Table Section */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Exchange History
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {showAll
                ? "Showing all exchange records."
                : "Showing exchanges from the last 3 months."}
            </p>
          </div>

          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
          >
            <option value="all">All Months</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {new Date(`${month}-01T00:00:00`).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Exchange Date</th>
                <th className="px-5 py-3 text-right font-semibold">
                  USD Allocated
                </th>
                <th className="px-5 py-3 text-right font-semibold">
                  Exchange Rate
                </th>
                <th className="px-5 py-3 text-right font-semibold">
                  AFN Received
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {displayedExchanges.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No exchange records found for this period.
                  </td>
                </tr>
              ) : (
                displayedExchanges.map((exchange) => {
                  const rate = Number(exchange.ex_rate ?? 0);
                  const amountAFN = Number(exchange.amount_af ?? 0);
                  const amountUSD = rate > 0 ? amountAFN / rate : 0;

                  return (
                    <tr
                      key={
                        exchange.exchange_id ??
                        `${exchange.date_of_exchange}-${amountAFN}`
                      }
                      className="hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                        {formatFriendlyDate(
                          String(exchange.date_of_exchange ?? ""),
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-gray-700">
                        ${formatNumber(amountUSD)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-gray-700">
                        {formatNumber(rate)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-gray-900">
                        ؋{formatNumber(amountAFN)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Totals */}
        <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-gray-700">
            {selectedMonth === "all"
              ? "Grand Total — All Displayed"
              : `Grand Total — ${new Date(
                `${selectedMonth}-01T00:00:00`,
              ).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}`}
          </span>

          <div className="flex flex-wrap justify-end gap-x-6 gap-y-2 text-sm">
            <span className="text-gray-600">
              USD:{" "}
              <strong className="text-gray-900">
                ${formatNumber(totalUSD)}
              </strong>
            </span>
            <span className="text-gray-600">
              AFN:{" "}
              <strong className="text-green-700">
                ؋{formatNumber(totalAFN)}
              </strong>
            </span>
          </div>
        </div>
      </section>

      {/* Show All Toggle Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          {showAll ? "Show Only Last 3 Months" : "Show All.."}
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ExchangeFormModal
          maxUnallocatedUSD={exactUnallocatedUSD}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleExchangeCreated}
        />
      )}
    </div>
  );
}
