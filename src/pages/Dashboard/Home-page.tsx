// import Loader from "../../components/common/Loader";
// import { useState } from "react";
// import { getCurrentCashBalance } from "../../api/homeApi";
// import {
//   FaWallet,
//   FaExchangeAlt,
//   FaMoneyBillWave,
//   FaReceipt,
//   FaCalendarAlt,
//   FaChartBar,
//   FaArrowDown,
//   FaArrowUp,
//   FaSyncAlt,
//   FaFileInvoiceDollar,
// } from "react-icons/fa";
// import { getHomeYearlyReport, getHomeUnallocatedYearly, getHomeMonthlyTotals, } from "../../api/homeApi";
// const MONTHS = [
//   "January", "February", "March", "April", "May", "June", "July", "August",
//   "September", "October", "November", "December",];

// const cashBalance = getCurrentCashBalance();
// const currentCashBalance = cashBalance.data?.remainder ?? 0;
// const CURRENT_DATE = new Date();
// const CURRENT_YEAR = CURRENT_DATE.getFullYear();
// const CURRENT_MONTH = CURRENT_DATE.getMonth() + 1;

// const formatNumber = (value: number | null | undefined) =>
//   (value ?? 0).toLocaleString("en-US", {
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 2,
//   });

// const formatCurrency = (value: number | null | undefined, currency: string) =>
//   `${currency} ${formatNumber(value)}`;

// const HomePage = () => {
//   const [showLoader, setShowLoader] = useState(true);

//   const [year, setYear] = useState(CURRENT_YEAR);
//   const [month, setMonth] = useState<number | "all">("all");

//   const selectedMonth = month === "all" ? undefined : month;
//   const chartMonth = selectedMonth ?? CURRENT_MONTH;

//   const yearlyReport = getHomeYearlyReport(year, selectedMonth);
//   const unallocatedReport = getHomeUnallocatedYearly(year);
//   const monthlyTotals = getHomeMonthlyTotals(chartMonth, year);

//   const report = yearlyReport.data;
//   const unallocated = unallocatedReport.data;
//   const monthly = monthlyTotals.data;

//   const loading =
//     yearlyReport.loading || unallocatedReport.loading || monthlyTotals.loading;

//   const error =
//     yearlyReport.error || unallocatedReport.error || monthlyTotals.error;

//   const periodLabel =
//     month === "all" ? `Full year ${year}` : `${MONTHS[month - 1]} ${year}`;

//   // Monthly values come from monthly-totals.
//   // Full-year values come from unallocated-yearly.
//   const receivedUsd =
//     month === "all"
//       ? (unallocated?.transaction_income_usd.total ?? 0)
//       : (monthly?.transaction_income_usd.total ?? 0);

//   const allocatedUsd =
//     month === "all"
//       ? (unallocated?.exchanged_to_af_usd.total ?? 0)
//       : (monthly?.exchanged_to_af_usd.total ?? 0);

//   const unallocatedUsd = unallocated?.unallocated_usd ?? 0;

//   const exchangeIncomeAfn = report?.exchange_income.total ?? 0;
//   const totalExpenses = report?.total_expense.total ?? 0;
//   const otherExpenses =
//     report?.total_expense.breakdown.other_expenses.total ?? 0;
//   const payrollExpenses = report?.total_expense.breakdown.payrolls.total ?? 0;

//   const maxChartValue = Math.max(receivedUsd, allocatedUsd, 1);

//   const receivedBarHeight = (receivedUsd / maxChartValue) * 100;
//   const allocatedBarHeight = (allocatedUsd / maxChartValue) * 100;

//   const hasError = Boolean(error);
//   const statCards = [
//     {
//       title: "Income Received",
//       value: formatCurrency(receivedUsd, "USD"),
//       subtitle:
//         month === "all"
//           ? `Total income received in ${year}`
//           : `Income received in ${periodLabel}`,
//       period: month === "all" ? "Yearly" : "Monthly",
//       icon: FaWallet,
//       iconStyle: "bg-blue-50 text-blue-700",
//       accent: "border-t-blue-600",
//     },
//     {
//       title: "Allocated amount (USD)",
//       value: formatCurrency(allocatedUsd, "USD"),
//       subtitle:
//         month === "all"
//           ? `Total USD exchanged in ${year}`
//           : `USD exchanged in ${periodLabel}`,
//       period: month === "all" ? "Yearly" : "Monthly",
//       icon: FaExchangeAlt,
//       iconStyle: "bg-indigo-50 text-indigo-700",
//       accent: "border-t-indigo-600",
//     },
//     {
//       title: "Unallocated Amount",
//       value: formatCurrency(unallocatedUsd, "USD"),
//       subtitle: `Remaining balance for the full year ${year}`,
//       period: "Yearly",
//       icon: FaMoneyBillWave,
//       iconStyle: "bg-emerald-50 text-emerald-700",
//       accent: "border-t-emerald-600",
//     },
//     {
//       title: "Total Expenses",
//       value: formatNumber(totalExpenses),
//       subtitle: `${formatNumber(report?.total_expense.count)} recorded expenses`,
//       period: month === "all" ? "Yearly" : "Monthly",
//       icon: FaReceipt,
//       iconStyle: "bg-amber-50 text-amber-700",
//       accent: "border-t-amber-500",
//     },
//   ];
//   return (
//     <div className="min-h-screen space-y-6 bg-slate-50/70 p-4 sm:p-6 lg:p-8">
//       {/* Header */}
//       <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 p-6 text-white shadow-lg sm:p-8">
//         <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[35px] border-white/5" />
//         <div className="pointer-events-none absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-blue-400/10 blur-2xl" />
//         <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
//           <div>
//             <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-100">
//               <FaChartBar />
//               FIRST RATE AFGHANISTAN
//             </div>

//             <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
//               Financial Overview
//             </h1>

//             <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
//               Monitor income, currency allocation, and business expenses from
//               one central dashboard.
//             </p>
//           </div>

//           <div className="flex items-center gap-3 self-start rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm md:self-center">
//             <div className="rounded-lg bg-white/15 p-2.5">
//               <FaCalendarAlt className="text-xl" />
//             </div>
//             <div>
//               <p className="text-xs text-blue-100">Selected report</p>
//               <p className="mt-1 font-semibold">{periodLabel}</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Report Filters */}
//       <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h2 className="font-semibold text-slate-800">Report Period</h2>
//           <p className="mt-1 text-sm text-slate-500">
//             Choose a month or review the full year.
//           </p>
//         </div>

//         <div className="flex flex-col gap-3 sm:flex-row">
//           <select
//             aria-label="Select report month"
//             value={month}
//             onChange={(event) =>
//               setMonth(
//                 event.target.value === "all"
//                   ? "all"
//                   : Number(event.target.value),
//               )
//             }
//             className="min-w-40 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//           >
//             <option value="all">Full year</option>
//             {MONTHS.map((monthName, index) => (
//               <option key={monthName} value={index + 1}>
//                 {monthName}
//               </option>
//             ))}
//           </select>

//           <select
//             aria-label="Select report year"
//             value={year}
//             onChange={(event) => setYear(Number(event.target.value))}
//             className="min-w-32 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//           >
//             {Array.from(
//               { length: 7 },
//               (_, index) => CURRENT_YEAR - 5 + index,
//             ).map((yearOption) => (
//               <option key={yearOption} value={yearOption}>
//                 {yearOption}
//               </option>
//             ))}
//           </select>

//           <button
//             type="button"
//             onClick={() => {
//               setYear(CURRENT_YEAR);
//               setMonth("all");
//               yearlyReport.refetch();
//               unallocatedReport.refetch();
//               monthlyTotals.refetch();
//             }}
//             className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
//           >
//             <FaSyncAlt />
//             Reset
//           </button>
//         </div>
//       </section>

//       {/* Loading and Error States */}
//       {loading && (
//         <Loader message="Loading financial reports..." />
//       )}

//       {hasError && (
//         <div
//           role="alert"
//           className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
//         >
//           <p className="font-semibold">Unable to load all dashboard data.</p>
//           <p className="mt-1">
//             {error}. Check the backend connection and try again.
//           </p>
//           <button
//             type="button"
//             onClick={() => {
//               yearlyReport.refetch();
//               unallocatedReport.refetch();
//               monthlyTotals.refetch();
//             }}
//             className="mt-3 font-semibold underline underline-offset-2"
//           >
//             Try again
//           </button>
//         </div>
//       )}

//       {/* Financial Summary Cards */}
//       <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
//         {statCards.map((card) => {
//           const Icon = card.icon;

//           return (
//             <article
//               key={card.title}
//               className={`group relative overflow-hidden rounded-2xl border border-slate-200 border-t-4 ${card.accent} bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
//             >
//               <div className="flex items-start justify-between gap-3">
//                 <div
//                   className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconStyle}`}
//                 >
//                   <Icon className="text-xl" />
//                 </div>

//                 <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
//                   {card.period}
//                 </span>
//               </div>

//               <div className="mt-6">
//                 <p className="text-sm font-medium text-slate-500">
//                   {card.title}
//                 </p>

//                 <p
//                   className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900"
//                   title={card.value}
//                 >
//                   {card.value}
//                 </p>

//                 <p className="mt-2 min-h-8 text-xs leading-5 text-slate-500">
//                   {card.subtitle}
//                 </p>
//               </div>
//             </article>
//           );
//         })}
//       </section>

//       {/* Charts and Breakdown */}
//       <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
//         {/* USD Comparison Chart */}
//         <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
//           <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
//             <div>
//               <h2 className="text-lg font-bold text-slate-900">
//                 USD Received vs. Exchanged
//               </h2>
//               <p className="mt-1 text-sm text-slate-500">
//                 Compare the USD received with the USD exchanged into Afghanis.
//               </p>
//             </div>

//             <span className="w-fit rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
//               {month === "all" ? year : periodLabel}
//             </span>
//           </div>

//           <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
//             {/* Received */}
//             <div>
//               <div className="flex items-center gap-2">
//                 <span className="h-3 w-3 rounded-sm bg-blue-600" />
//                 <span className="text-sm font-medium text-slate-600">
//                   USD Received
//                 </span>
//               </div>

//               <p className="mt-3 text-xl font-bold text-slate-900">
//                 {formatCurrency(receivedUsd, "USD")}
//               </p>

//               <div className="mt-4 flex h-40 items-end rounded-xl bg-slate-50 p-4">
//                 <div className="flex h-full w-full items-end justify-center">
//                   <div
//                     className="w-2/3 rounded-t-xl bg-gradient-to-t from-blue-700 to-blue-400 transition-all duration-500"
//                     style={{
//                       height: `${Math.max(receivedUsd > 0 ? 8 : 0, receivedBarHeight)}%`,
//                     }}
//                     title={`Received: ${formatCurrency(receivedUsd, "USD")}`}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Allocated */}
//             <div>
//               <div className="flex items-center gap-2">
//                 <span className="h-3 w-3 rounded-sm bg-emerald-500" />
//                 <span className="text-sm font-medium text-slate-600">
//                   USD Allocated
//                 </span>
//               </div>

//               <p className="mt-3 text-xl font-bold text-slate-900">
//                 {formatCurrency(allocatedUsd, "USD")}
//               </p>

//               <div className="mt-4 flex h-40 items-end rounded-xl bg-slate-50 p-4">
//                 <div className="flex h-full w-full items-end justify-center">
//                   <div
//                     className="w-2/3 rounded-t-xl bg-gradient-to-t from-emerald-700 to-emerald-400 transition-all duration-500"
//                     style={{
//                       height: `${Math.max(allocatedUsd > 0 ? 8 : 0, allocatedBarHeight)}%`,
//                     }}
//                     title={`Allocated: ${formatCurrency(allocatedUsd, "USD")}`}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
//             <FaExchangeAlt className="mt-1 text-blue-700" />
//             <div>
//               <p className="text-sm font-semibold text-slate-800">
//                 USD Remaining
//               </p>
//               <p className="mt-1 text-sm text-slate-600">
//                 {formatCurrency(unallocatedUsd, "USD")} remains for the full
//                 year {year}, according to the yearly report.
//               </p>
//             </div>
//           </div>
//         </article>

//         {/* Expense Breakdown */}
//         <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
//           <div className="flex items-center justify-between gap-3">
//             <div>
//               <h2 className="text-lg font-bold text-slate-900">
//                 Expense Breakdown
//               </h2>
//               <p className="mt-1 text-sm text-slate-500">{periodLabel}</p>
//             </div>

//             <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
//               <FaFileInvoiceDollar className="text-xl" />
//             </div>
//           </div>

//           <div className="mt-8 flex justify-center">
//             <div
//               className="relative flex h-44 w-44 items-center justify-center rounded-full"
//               style={{
//                 background:
//                   totalExpenses > 0
//                     ? `conic-gradient(#2563eb 0deg ${(otherExpenses / totalExpenses) * 360}deg, #f59e0b ${(otherExpenses / totalExpenses) * 360}deg 360deg)`
//                     : "#e2e8f0",
//               }}
//             >
//               <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
//                 <span className="text-xs font-medium text-slate-500">
//                   Total expenses
//                 </span>
//                 <span className="mt-1 max-w-full px-2 text-center text-lg font-bold text-slate-900">
//                   {formatNumber(totalExpenses)}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="mt-8 space-y-5">
//             <div>
//               <div className="mb-2 flex items-center justify-between gap-3">
//                 <div className="flex items-center gap-2 text-sm text-slate-600">
//                   <span className="h-3 w-3 rounded-sm bg-blue-600" />
//                   Other expenses
//                 </div>
//                 <span className="text-sm font-semibold text-slate-900">
//                   {formatNumber(otherExpenses)}
//                 </span>
//               </div>

//               <div className="h-2 overflow-hidden rounded-full bg-slate-100">
//                 <div
//                   className="h-full rounded-full bg-blue-600 transition-all duration-500"
//                   style={{
//                     width: `${totalExpenses > 0 ? (otherExpenses / totalExpenses) * 100 : 0}%`,
//                   }}
//                 />
//               </div>
//               <p className="mt-1 text-xs text-slate-400">
//                 {report?.total_expense.breakdown.other_expenses.count ?? 0}{" "}
//                 records
//               </p>
//             </div>

//             <div>
//               <div className="mb-2 flex items-center justify-between gap-3">
//                 <div className="flex items-center gap-2 text-sm text-slate-600">
//                   <span className="h-3 w-3 rounded-sm bg-amber-500" />
//                   Payroll
//                 </div>
//                 <span className="text-sm font-semibold text-slate-900">
//                   {formatNumber(payrollExpenses)}
//                 </span>
//               </div>

//               <div className="h-2 overflow-hidden rounded-full bg-slate-100">
//                 <div
//                   className="h-full rounded-full bg-amber-500 transition-all duration-500"
//                   style={{
//                     width: `${totalExpenses > 0 ? (payrollExpenses / totalExpenses) * 100 : 0}%`,
//                   }}
//                 />
//               </div>
//               <p className="mt-1 text-xs text-slate-400">
//                 {report?.total_expense.breakdown.payrolls.count ?? 0} records
//               </p>
//             </div>
//           </div>
//         </article>
//       </section>

//       {/* Period Summary */}
//       <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
//         <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h2 className="text-lg font-bold text-slate-900">
//               Financial Report Details
//             </h2>
//             <p className="mt-1 text-sm text-slate-500">
//               A breakdown of income and expenses for {periodLabel}.
//             </p>
//           </div>
//           <span className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
//             {report?.year ?? year}
//           </span>
//         </div>

//         <div className="mt-5 divide-y divide-slate-100">
//           <div className="flex items-center justify-between gap-4 py-4">
//             <div className="flex items-center gap-3">
//               <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
//                 <FaArrowDown />
//               </div>
//               <div>
//                 <p className="text-sm font-semibold text-slate-800">
//                   Transaction Income
//                 </p>
//                 <p className="mt-1 text-xs text-slate-500">
//                   {report?.transaction_income.count ?? 0} transactions · USD
//                 </p>
//               </div>
//             </div>
//             <span className="text-right text-sm font-bold text-slate-900 sm:text-base">
//               {formatCurrency(report?.transaction_income.total, "USD")}
//             </span>
//           </div>

//           <div className="flex items-center justify-between gap-4 py-4">
//             <div className="flex items-center gap-3">
//               <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700">
//                 <FaExchangeAlt />
//               </div>
//               <div>
//                 <p className="text-sm font-semibold text-slate-800">
//                   Allocated amount in AFN
//                 </p>
//                 <p className="mt-1 text-xs text-slate-500">
//                   {report?.exchange_income.count ?? 0} exchanges · AFN
//                 </p>
//               </div>
//             </div>
//             <span className="text-right text-sm font-bold text-slate-900 sm:text-base">
//               {formatCurrency(exchangeIncomeAfn, "AFN")}
//             </span>
//           </div>

//           <div className="flex items-center justify-between gap-4 py-4">
//             <div className="flex items-center gap-3">
//               <div className="rounded-lg bg-amber-50 p-2.5 text-amber-700">
//                 <FaArrowUp />
//               </div>
//               <div>
//                 <p className="text-sm font-semibold text-slate-800">
//                   Total Expenses
//                 </p>
//                 <p className="mt-1 text-xs text-slate-500">
//                   Other expenses and payroll
//                 </p>
//               </div>
//             </div>
//             <span className="text-right text-sm font-bold text-slate-900 sm:text-base">
//               {formatNumber(totalExpenses)}
//             </span>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
//         <p>First Rate Afghanistan · Financial Management System</p>
//       </footer>
//     </div>
//   );
// };

// export default HomePage;




import Loader from "../../components/common/Loader";
import { useState } from "react";
import {
  getCurrentCashBalance,
  getHomeYearlyReport,
  getHomeUnallocatedYearly,
  getHomeMonthlyTotals,
} from "../../api/homeApi";
import {
  FaWallet,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaReceipt,
  FaCalendarAlt,
  FaChartBar,
  FaArrowDown,
  FaArrowUp,
  FaSyncAlt,
  FaFileInvoiceDollar,
} from "react-icons/fa";

const MONTHS = [
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

const CURRENT_DATE = new Date();
const CURRENT_YEAR = CURRENT_DATE.getFullYear();
const CURRENT_MONTH = CURRENT_DATE.getMonth() + 1;

const formatNumber = (value: number | null | undefined) =>
  (value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const formatCurrency = (
  value: number | null | undefined,
  currency: string,
) => `${currency} ${formatNumber(value)}`;

const HomePage = () => {
  const [showLoader, setShowLoader] = useState(true);

  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState<number | "all">("all");

  const selectedMonth = month === "all" ? undefined : month;
  const chartMonth = selectedMonth ?? CURRENT_MONTH;

  const yearlyReport = getHomeYearlyReport(year, selectedMonth);
  const unallocatedReport = getHomeUnallocatedYearly(year);
  const monthlyTotals = getHomeMonthlyTotals(chartMonth, year);
  const cashBalance = getCurrentCashBalance();

  const report = yearlyReport.data;
  const unallocated = unallocatedReport.data;
  const monthly = monthlyTotals.data;

  const currentCashBalance = cashBalance.data?.remainder ?? 0;

  const loading =
    yearlyReport.loading ||
    unallocatedReport.loading ||
    monthlyTotals.loading ||
    cashBalance.loading;

  const error =
    yearlyReport.error ||
    unallocatedReport.error ||
    monthlyTotals.error ||
    cashBalance.error;

  const periodLabel =
    month === "all" ? `Full year ${year}` : `${MONTHS[month - 1]} ${year}`;

  // Monthly values come from monthly-totals.
  // Full-year values come from unallocated-yearly.
  const receivedUsd =
    month === "all"
      ? (unallocated?.transaction_income_usd.total ?? 0)
      : (monthly?.transaction_income_usd.total ?? 0);

  const allocatedUsd =
    month === "all"
      ? (unallocated?.exchanged_to_af_usd.total ?? 0)
      : (monthly?.exchanged_to_af_usd.total ?? 0);

  const unallocatedUsd = unallocated?.unallocated_usd ?? 0;

  const exchangeIncomeAfn = report?.exchange_income.total ?? 0;
  const totalExpenses = report?.total_expense.total ?? 0;
  const otherExpenses =
    report?.total_expense.breakdown.other_expenses.total ?? 0;
  const payrollExpenses = report?.total_expense.breakdown.payrolls.total ?? 0;

  const maxChartValue = Math.max(receivedUsd, allocatedUsd, 1);

  const receivedBarHeight = (receivedUsd / maxChartValue) * 100;
  const allocatedBarHeight = (allocatedUsd / maxChartValue) * 100;

  const hasError = Boolean(error);

  const statCards = [
    {
      title: "Income Received",
      value: formatCurrency(receivedUsd, "USD"),
      subtitle:
        month === "all"
          ? `Total income received in ${year}`
          : `Income received in ${periodLabel}`,
      period: month === "all" ? "Yearly" : "Monthly",
      icon: FaWallet,
      iconStyle: "bg-blue-50 text-blue-700",
      accent: "border-t-blue-600",
    },
    {
      title: "Allocated amount (USD)",
      value: formatCurrency(allocatedUsd, "USD"),
      subtitle:
        month === "all"
          ? `Total USD exchanged in ${year}`
          : `USD exchanged in ${periodLabel}`,
      period: month === "all" ? "Yearly" : "Monthly",
      icon: FaExchangeAlt,
      iconStyle: "bg-indigo-50 text-indigo-700",
      accent: "border-t-indigo-600",
    },
    {
      title: "Unallocated Amount",
      value: formatCurrency(unallocatedUsd, "USD"),
      subtitle: `Remaining balance for the full year ${year}`,
      period: "Yearly",
      icon: FaMoneyBillWave,
      iconStyle: "bg-emerald-50 text-emerald-700",
      accent: "border-t-emerald-600",
    },
    {
      title: "Total Expenses",
      value: formatNumber(totalExpenses),
      subtitle: `${formatNumber(report?.total_expense.count)} recorded expenses`,
      period: month === "all" ? "Yearly" : "Monthly",
      icon: FaReceipt,
      iconStyle: "bg-amber-50 text-amber-700",
      accent: "border-t-amber-500",
    },
    {
      title: "Cash Balance",
      value: formatCurrency(currentCashBalance, "AFN"),
      subtitle: cashBalance.data?.date
        ? `Current remaining cash · Updated ${cashBalance.data.date}`
        : "Current remaining cash from the balance record",
      period: "Current",
      icon: FaWallet,
      iconStyle: "bg-cyan-50 text-cyan-700",
      accent: "border-t-cyan-500",
    },
  ];

  return (
    <div className="min-h-screen space-y-6 bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-blue-400/10 blur-2xl" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-100">
              <FaChartBar />
              FIRST RATE AFGHANISTAN
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Financial Overview
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
              Monitor income, currency allocation, and business expenses from
              one central dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm md:self-center">
            <div className="rounded-lg bg-white/15 p-2.5">
              <FaCalendarAlt className="text-xl" />
            </div>
            <div>
              <p className="text-xs text-blue-100">Selected report</p>
              <p className="mt-1 font-semibold">{periodLabel}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Report Filters */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-800">Report Period</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose a month or review the full year.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            aria-label="Select report month"
            value={month}
            onChange={(event) =>
              setMonth(
                event.target.value === "all"
                  ? "all"
                  : Number(event.target.value),
              )
            }
            className="min-w-40 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">Full year</option>
            {MONTHS.map((monthName, index) => (
              <option key={monthName} value={index + 1}>
                {monthName}
              </option>
            ))}
          </select>

          <select
            aria-label="Select report year"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="min-w-32 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {Array.from(
              { length: 7 },
              (_, index) => CURRENT_YEAR - 5 + index,
            ).map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setYear(CURRENT_YEAR);
              setMonth("all");
              yearlyReport.refetch();
              unallocatedReport.refetch();
              monthlyTotals.refetch();
              cashBalance.refetch();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <FaSyncAlt />
            Reset
          </button>
        </div>
      </section>

      {/* Loading and Error States */}
      {loading && <Loader message="Loading financial reports..." />}

      {hasError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="font-semibold">Unable to load all dashboard data.</p>
          <p className="mt-1">
            {error}. Check the backend connection and try again.
          </p>
          <button
            type="button"
            onClick={() => {
              yearlyReport.refetch();
              unallocatedReport.refetch();
              monthlyTotals.refetch();
              cashBalance.refetch();
            }}
            className="mt-3 font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* Financial Summary Cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200 border-t-4 ${card.accent} bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconStyle}`}
                >
                  <Icon className="text-xl" />
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {card.period}
                </span>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <p
                  className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900"
                  title={card.value}
                >
                  {card.value}
                </p>

                <p className="mt-2 min-h-8 text-xs leading-5 text-slate-500">
                  {card.subtitle}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      {/* Charts and Breakdown */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* USD Comparison Chart */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                USD Received vs. Exchanged
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Compare the USD received with the USD exchanged into Afghanis.
              </p>
            </div>

            <span className="w-fit rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {month === "all" ? year : periodLabel}
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {/* Received */}
            <div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-blue-600" />
                <span className="text-sm font-medium text-slate-600">
                  USD Received
                </span>
              </div>

              <p className="mt-3 text-xl font-bold text-slate-900">
                {formatCurrency(receivedUsd, "USD")}
              </p>

              <div className="mt-4 flex h-40 items-end rounded-xl bg-slate-50 p-4">
                <div className="flex h-full w-full items-end justify-center">
                  <div
                    className="w-2/3 rounded-t-xl bg-gradient-to-t from-blue-700 to-blue-400 transition-all duration-500"
                    style={{
                      height: `${Math.max(receivedUsd > 0 ? 8 : 0, receivedBarHeight)}%`,
                    }}
                    title={`Received: ${formatCurrency(receivedUsd, "USD")}`}
                  />
                </div>
              </div>
            </div>

            {/* Allocated */}
            <div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                <span className="text-sm font-medium text-slate-600">
                  USD Allocated
                </span>
              </div>

              <p className="mt-3 text-xl font-bold text-slate-900">
                {formatCurrency(allocatedUsd, "USD")}
              </p>

              <div className="mt-4 flex h-40 items-end rounded-xl bg-slate-50 p-4">
                <div className="flex h-full w-full items-end justify-center">
                  <div
                    className="w-2/3 rounded-t-xl bg-gradient-to-t from-emerald-700 to-emerald-400 transition-all duration-500"
                    style={{
                      height: `${Math.max(allocatedUsd > 0 ? 8 : 0, allocatedBarHeight)}%`,
                    }}
                    title={`Allocated: ${formatCurrency(allocatedUsd, "USD")}`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <FaExchangeAlt className="mt-1 text-blue-700" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                USD Remaining
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {formatCurrency(unallocatedUsd, "USD")} remains for the full
                year {year}, according to the yearly report.
              </p>
            </div>
          </div>
        </article>

        {/* Expense Breakdown */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Expense Breakdown
              </h2>
              <p className="mt-1 text-sm text-slate-500">{periodLabel}</p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <FaFileInvoiceDollar className="text-xl" />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div
              className="relative flex h-44 w-44 items-center justify-center rounded-full"
              style={{
                background:
                  totalExpenses > 0
                    ? `conic-gradient(#2563eb 0deg ${(otherExpenses / totalExpenses) * 360}deg, #f59e0b ${(otherExpenses / totalExpenses) * 360}deg 360deg)`
                    : "#e2e8f0",
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-xs font-medium text-slate-500">
                  Total expenses
                </span>
                <span className="mt-1 max-w-full px-2 text-center text-lg font-bold text-slate-900">
                  {formatNumber(totalExpenses)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-3 w-3 rounded-sm bg-blue-600" />
                  Other expenses
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {formatNumber(otherExpenses)}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${totalExpenses > 0 ? (otherExpenses / totalExpenses) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {report?.total_expense.breakdown.other_expenses.count ?? 0}{" "}
                records
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-3 w-3 rounded-sm bg-amber-500" />
                  Payroll
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {formatNumber(payrollExpenses)}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{
                    width: `${totalExpenses > 0 ? (payrollExpenses / totalExpenses) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {report?.total_expense.breakdown.payrolls.count ?? 0} records
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Period Summary */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Financial Report Details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A breakdown of income and expenses for {periodLabel}.
            </p>
          </div>
          <span className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {report?.year ?? year}
          </span>
        </div>

        <div className="mt-5 divide-y divide-slate-100">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
                <FaArrowDown />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Transaction Income
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {report?.transaction_income.count ?? 0} transactions · USD
                </p>
              </div>
            </div>
            <span className="text-right text-sm font-bold text-slate-900 sm:text-base">
              {formatCurrency(report?.transaction_income.total, "USD")}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700">
                <FaExchangeAlt />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Allocated amount in AFN
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {report?.exchange_income.count ?? 0} exchanges · AFN
                </p>
              </div>
            </div>
            <span className="text-right text-sm font-bold text-slate-900 sm:text-base">
              {formatCurrency(exchangeIncomeAfn, "AFN")}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-2.5 text-amber-700">
                <FaArrowUp />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Total Expenses
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Other expenses and payroll
                </p>
              </div>
            </div>
            <span className="text-right text-sm font-bold text-slate-900 sm:text-base">
              {formatNumber(totalExpenses)}
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>First Rate Afghanistan · Financial Management System</p>
      </footer>
    </div>
  );
};

export default HomePage;
