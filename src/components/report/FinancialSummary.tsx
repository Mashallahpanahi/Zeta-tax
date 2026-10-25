import { useState } from "react";
import {
  useUnallocatedYearly,
  useMonthlyTotals,
  useCurrentBalance,
} from "../../api/homeApi";

// Format numbers with commas (e.g., 350000 -> 350,000)
const formatNumber = (num: number | undefined) => {
  if (num === undefined) return "0";
  return new Intl.NumberFormat("en-US").format(num);
};

export default function FinancialSummary() {
  // Default to current year and month
  const currentDate = new Date();
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1); // 1-12

  // Fetch data based on selected state
  const { data: yearlyData, loading: loadingYearly } =
    useUnallocatedYearly(year);
  const { data: monthlyData, loading: loadingMonthly } = useMonthlyTotals(
    month,
    year,
  );
  const { data: balanceData, loading: loadingBalance } = useCurrentBalance();

  const isLoading = loadingYearly || loadingMonthly || loadingBalance;

  // Generate Year Options (Current year - 5 to Current year + 1)
  const yearOptions = [];
  for (
    let y = currentDate.getFullYear() - 5;
    y <= currentDate.getFullYear() + 1;
    y++
  ) {
    yearOptions.push(y);
  }

  // Month names for the dropdown
  const monthNames = [
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

  return (
    <div className="w-full overflow-hidden rounded-xl border-2 border-gray-300 bg-white text-sm shadow-sm">
      {/* Table Header */}
      <div className="grid grid-cols-4 border-b-2 border-gray-300 bg-gray-50 font-semibold">
        <div className="border-r-2 border-gray-300 p-3"></div>
        <div className="border-r-2 border-gray-300 p-3 text-center">
          income_received (USD)
        </div>
        <div className="border-r-2 border-gray-300 p-3 text-center">
          exchanged (allocated)
        </div>
        <div className="p-3 text-center">Select Date</div>
      </div>

      {/* Yearly Row */}
      <div className="grid grid-cols-4 border-b-2 border-gray-300">
        <div className="border-r-2 border-gray-300 p-3 font-medium flex items-center">
          Yearly ({year})
        </div>
        <div className="border-r-2 border-gray-300 p-3 text-center flex items-center justify-center">
          {isLoading
            ? "..."
            : `total = $${formatNumber(yearlyData?.transaction_income_usd?.total)}`}
        </div>

        {/* ✅ Yearly Exchanged Column: USD top, AFN bottom */}
        <div className="border-r-2 border-gray-300 p-2 flex flex-col items-center justify-center">
          <span className="font-semibold text-gray-800">
            {isLoading
              ? "..."
              : `total = $${formatNumber(yearlyData?.exchanged_to_af_usd?.total)}`}
          </span>
          <span className="text-xs text-gray-500 mt-0.5">
            {isLoading
              ? ""
              : `(total = ${formatNumber(yearlyData?.exchanged_to_af_afn?.total)} AFN)`}
          </span>
        </div>

        <div className="p-3 flex justify-center items-center">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full max-w-[120px] rounded border border-gray-300 px-2 py-1 outline-none focus:border-blue-firstRate"
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
      <div className="grid grid-cols-4 border-b-2 border-gray-300">
        <div className="border-r-2 border-gray-300 p-3 font-medium flex items-center">
          Monthly ({month})
        </div>
        <div className="border-r-2 border-gray-300 p-3 text-center flex items-center justify-center">
          {isLoading
            ? "..."
            : `total = $${formatNumber(monthlyData?.transaction_income_usd?.total)}`}
        </div>

        {/* ✅ Monthly Exchanged Column: USD top, AFN bottom */}
        <div className="border-r-2 border-gray-300 p-2 flex flex-col items-center justify-center">
          <span className="font-semibold text-gray-800">
            {isLoading
              ? "..."
              : `total = $${formatNumber(monthlyData?.exchanged_to_af_usd?.total)}`}
          </span>
          <span className="text-xs text-gray-500 mt-0.5">
            {isLoading
              ? ""
              : `(total = ${formatNumber(monthlyData?.exchanged_to_af_afn?.total)} AFN)`}
          </span>
        </div>

        <div className="p-3 flex justify-center items-center">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full max-w-[140px] rounded border border-gray-300 px-2 py-1 outline-none focus:border-blue-firstRate"
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
        <div className="p-4 font-medium flex items-center">
          Cash ={" "}
          <span
            className={`ml-2 font-bold ${Number(balanceData?.current_balance) < 0 ? "text-red-600" : "text-green-600"}`}
          >
            {isLoading
              ? "..."
              : `${formatNumber(balanceData?.current_balance)} AFN`}
          </span>
        </div>
      </div>
    </div>
  );
}
