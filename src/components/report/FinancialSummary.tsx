import { useState } from "react";
import {
  useUnallocatedYearly,
  useMonthlyTotals,
  useCurrentBalance,
  useYearlyReport, // ✅ Added to get the correct total expenses
} from "../../api/reportApi";

// Format numbers with commas
const formatNumber = (num: number | undefined) => {
  if (num === undefined) return "0";
  return new Intl.NumberFormat("en-US").format(num);
};

export default function FinancialSummary() {
  const currentDate = new Date();
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);

  // ✅ Extract refetch functions from the hooks
  const {
    data: yearlyData,
    loading: loadingYearly,
    refetch: refetchYearly,
  } = useUnallocatedYearly(year);
  
  const {
    data: monthlyData,
    loading: loadingMonthly,
    refetch: refetchMonthly,
  } = useMonthlyTotals(month, year);

  // ✅ Fetch exact expenses from the report API
  const {
    data: yearlyReportData,
    loading: loadingYearlyReport,
    refetch: refetchYearlyReport,
  } = useYearlyReport(year);

  const {
    data: monthlyReportData,
    loading: loadingMonthlyReport,
    refetch: refetchMonthlyReport,
  } = useYearlyReport(year, month);

  const {
    data: balanceData,
    loading: loadingBalance,
    refetch: refetchBalance,
  } = useCurrentBalance();

  const isLoading =
    loadingYearly ||
    loadingMonthly ||
    loadingBalance ||
    loadingYearlyReport ||
    loadingMonthlyReport;

  // ✅ Refresh only the Financial Summary data
  const handleRefresh = () => {
    refetchYearly();
    refetchMonthly();
    refetchBalance();
    refetchYearlyReport();
    refetchMonthlyReport();
  };

  const yearOptions = [];
  for (
    let y = currentDate.getFullYear() - 5;
    y <= currentDate.getFullYear() + 1;
    y++
  ) {
    yearOptions.push(y);
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // ✅ Custom Grid Columns: [1st Col] [Income] [Exchanged] [Expenses] [Date Picker]
  const gridStyle =
    "grid grid-cols-[minmax(100px,1fr)_1.2fr_1.2fr_1.2fr_minmax(130px,150px)]";

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        CashBook Overview
      </h1>
      <p className="pl-3 text-sm text-gray-500">
        Monitor your cash flow with a detailed breakdown of yearly and monthly
        income, exchanges, and expenses.
      </p>
      <div className="w-full overflow-hidden rounded-xl border-2 border-gray-300 bg-white text-sm shadow-sm">
        {/* Table Header */}
        <div
          className={`${gridStyle} border-b-2 border-gray-300 bg-gray-50 font-semibold`}
        >
          <div className="border-r-2 border-gray-300 p-3"></div>
          <div className="border-r-2 border-gray-300 p-3 text-center">
            income_received (USD)
          </div>
          <div className="border-r-2 border-gray-300 p-3 text-center">
            exchanged (allocated)
          </div>
          <div className="border-r-2 border-gray-300 p-3 text-center">
            total expenses(AFN)
          </div>
          <div className="p-3 text-center">Select Date</div>
        </div>

        {/* Yearly Row */}
        <div className={`${gridStyle} border-b-2 border-gray-300`}>
          <div className="border-r-2 border-gray-300 p-3 font-medium flex items-center">
            Yearly ({year})
          </div>
          <div className="border-r-2 border-gray-300 p-3 text-center flex items-center justify-center">
            {isLoading
              ? "..."
              : `$${formatNumber(yearlyData?.transaction_income_usd?.total)}`}
          </div>

          <div className="border-r-2 border-gray-300 p-2 flex flex-col items-center justify-center text-center">
            <span className="font-semibold text-gray-800">
              {isLoading
                ? "..."
                : `$${formatNumber(yearlyData?.exchanged_to_af_usd?.total)}`}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">
              {isLoading
                ? ""
                : `(${formatNumber(yearlyData?.exchanged_to_af_afn?.total)} AFN)`}
            </span>
          </div>

          {/* ✅ Yearly Expenses Data (Using yearlyReportData) */}
          <div className="border-r-2 border-gray-300 p-3 text-center flex items-center justify-center font-semibold text-red-600">
            {isLoading
              ? "..."
              : `${formatNumber(yearlyReportData?.total_expense?.total)} af`}
          </div>

          <div className="p-3 flex justify-center items-center">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded border border-gray-300 px-2 py-1 outline-none focus:border-blue-firstRate text-sm"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Monthly Row */}
        <div className={`${gridStyle} border-b-2 border-gray-300`}>
          <div className="border-r-2 border-gray-300 p-3 font-medium flex items-center">
            Monthly ({month})
          </div>
          <div className="border-r-2 border-gray-300 p-3 text-center flex items-center justify-center">
            {isLoading
              ? "..."
              : `$${formatNumber(monthlyData?.transaction_income_usd?.total)}`}
          </div>

          <div className="border-r-2 border-gray-300 p-2 flex flex-col items-center justify-center text-center">
            <span className="font-semibold text-gray-800">
              {isLoading
                ? "..."
                : `$${formatNumber(monthlyData?.exchanged_to_af_usd?.total)}`}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">
              {isLoading
                ? ""
                : `(${formatNumber(monthlyData?.exchanged_to_af_afn?.total)} AFN)`}
            </span>
          </div>

          {/* ✅ Monthly Expenses Data (Using monthlyReportData) */}
          <div className="border-r-2 border-gray-300 p-3 text-center flex items-center justify-center font-semibold text-red-600">
            {isLoading
              ? "..."
              : `${formatNumber(monthlyReportData?.total_expense?.total)} af`}
          </div>

          <div className="p-3 flex justify-center items-center">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded border border-gray-300 px-2 py-1 outline-none focus:border-blue-firstRate text-sm"
            >
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom Summary Row (Unallocated & Cash) */}
        <div className="grid grid-cols-2 bg-gray-200">
          <div className="border-r-2 border-gray-300 p-4 font-medium flex items-center">
            Total unallocated (USD) ={" "}
            <span className="ml-2 font-bold text-blue-firstRate">
              {isLoading
                ? "..."
                : `$${formatNumber(yearlyData?.unallocated_usd)}`}
            </span>
          </div>
          <div className="p-4 font-medium flex items-center justify-between">
            <div>
              Cash ={" "}
              <span
                className={`ml-2 font-bold ${Number(balanceData?.remainder) < 0 ? "text-red-600" : "text-green-600"}`}
              >
                {isLoading
                  ? "..."
                  : `${formatNumber(balanceData?.remainder)} AFN`}
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh Data"
              className="rounded-lg border border-gray-300 bg-white p-1.5 text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-50"
            >
              <svg
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}