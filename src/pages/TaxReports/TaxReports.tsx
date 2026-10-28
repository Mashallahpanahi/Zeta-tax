import Loader from "../../components/common/Loader";
import { useState } from "react";
import {
    FaCalendarAlt,
    FaChevronDown,
    FaChevronUp,
} from "react-icons/fa";
import {
    useYearlyTaxReport,
    useQuarterlyTaxReport,
} from "../../api/taxReportApi";

const currentYear = new Date().getFullYear();
const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
    }).format(value ?? 0);

const formatAFN = (value: number) => formatNumber(value);
const getMonthRange = (months: number[]) =>
    months.length > 0
        ? `Months ${months[0]} – ${months[months.length - 1]}`
        : "";

const getMonthPeriod = (months: number[]) => {
    if (months.length === 0) return "";
    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    return `${monthNames[months[0] - 1]} – ${monthNames[months[months.length - 1] - 1]
        }`;
};
const TaxReportsPage = () => {
    const [year, setYear] = useState(currentYear);
    const [expandedQuarter, setExpandedQuarter] = useState<string | null>(
        null,);
    const yearlyReport = useYearlyTaxReport(year);
    const quarterlyReport = useQuarterlyTaxReport(year);
    const yearly = yearlyReport.data;
    const quarterly = quarterlyReport.data;
    const years = Array.from(
        { length: 6 },
        (_, index) => currentYear - index,
    );
    const handleYearChange = (value: string) => {
        setYear(Number(value));
        setExpandedQuarter(null);
    };
    const yearSelector = (
        <select
            value={year}
            onChange={(event) => handleYearChange(event.target.value)}
            className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            aria-label="Select tax report year"
        >
            {years.map((item) => (
                <option key={item} value={item}>
                    {item}
                </option>
            ))}
        </select>
    );

    return (
        <div className="min-h-full space-y-5 bg-slate-50 p-4 md:p-6">
            {/* Page heading */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Tax Reports
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        View your yearly and quarterly tax summary based on your
                        income and expenses.
                    </p>
                </div>
            </div>

            {/* Yearly API status */}
            {yearlyReport.loading && (
                <Loader message="Loading yearly tax report..." />
            )}

            {yearlyReport.error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    Unable to load yearly tax report: {yearlyReport.error}
                </p>
            )}
            {/* Quarterly report */}
            <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Quarterly Tax Report
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Breakdown of income, tax and totals for each quarter.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-600" />
                        {yearSelector}
                    </div>
                </div>

                {quarterlyReport.loading && (
                    <p className="mt-5 text-sm text-slate-500">
                        Loading quarterly report...
                    </p>
                )}

                {quarterlyReport.error && (
                    <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        Unable to load quarterly report: {quarterlyReport.error}
                    </p>
                )}

                {quarterly && !quarterlyReport.loading && (
                    <div className="mt-5 space-y-3">
                        {quarterly.quarters.map((quarter) => {
                            const isExpanded = expandedQuarter === quarter.quarter;

                            return (
                                <div
                                    key={quarter.quarter}
                                    className="overflow-hidden rounded-xl border border-blue-100"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setExpandedQuarter(
                                                isExpanded ? null : quarter.quarter,
                                            )
                                        }
                                        aria-expanded={isExpanded}
                                        className="grid w-full grid-cols-1 items-center gap-4 bg-white p-4 text-left transition hover:bg-blue-50/50 md:grid-cols-[1.2fr_1fr_1fr_0.8fr_auto]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-11 w-12 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                                                {quarter.quarter}
                                            </span>

                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {getMonthRange(quarter.months)}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {getMonthPeriod(quarter.months)}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Total Income (AFN)
                                            </p>
                                            <p className="mt-1 font-semibold text-slate-900">
                                                {formatAFN(quarter.total_income)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Tax (AFN)
                                            </p>
                                            <p className="mt-1 font-semibold text-slate-900">
                                                {formatAFN(quarter.total_tax)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">Tax Rate</p>
                                            <p className="mt-1 font-semibold text-slate-900">
                                                {quarter.breakdown.length > 0
                                                    ? `${quarter.breakdown[0].tax_rate}%`
                                                    : `${quarterly.tax_rate_percentage}%`}
                                            </p>
                                        </div>

                                        <span className="justify-self-end text-slate-500">
                                            {isExpanded ? (
                                                <FaChevronUp />
                                            ) : (
                                                <FaChevronDown />
                                            )}
                                        </span>
                                    </button>

                                    {isExpanded && (
                                        <div className="overflow-x-auto border-t border-blue-100 p-3">
                                            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                                                <thead className="bg-blue-50 text-slate-700">
                                                    <tr>
                                                        <th className="px-4 py-3 font-semibold">
                                                            Month
                                                        </th>
                                                        <th className="px-4 py-3 font-semibold">
                                                            Total Income (AFN)
                                                        </th>
                                                        <th className="px-4 py-3 font-semibold">
                                                            Tax Rate
                                                        </th>
                                                        <th className="px-4 py-3 font-semibold">
                                                            Tax (AFN)
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {quarter.breakdown.map((month) => (
                                                        <tr
                                                            key={month.month_number}
                                                            className="border-b border-blue-50 text-slate-600"
                                                        >
                                                            <td className="px-4 py-3">
                                                                {month.month_name} ({month.month_number})
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {formatAFN(month.total_income)}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {month.tax_rate}%
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {formatAFN(month.tax)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>

                                                <tfoot className="bg-blue-50 font-bold text-slate-900">
                                                    <tr>
                                                        <td className="px-4 py-3">
                                                            {quarter.quarter} Total
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {formatAFN(quarter.total_income)}
                                                        </td>
                                                        <td className="px-4 py-3">-</td>
                                                        <td className="px-4 py-3">
                                                            {formatAFN(quarter.total_tax)}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Yearly summary */}
            <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                    Yearly Tax Summary
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Details of your income, expenses, profit and tax for the
                    selected year.
                </p>

                {yearly && (
                    <div className="mt-5 grid grid-cols-2 gap-4 rounded-lg bg-blue-50/70 p-4 md:grid-cols-3 xl:grid-cols-6">
                        {[
                            { label: "Year", value: String(yearly.year) },
                            {
                                label: "Total Income (AFN)",
                                value: formatAFN(yearly.total_amount_afn),
                            },
                            {
                                label: "Total Expenses (AFN)",
                                value: formatAFN(yearly.total_expense),
                            },
                            {
                                label: "Profit (AFN)",
                                value: formatAFN(yearly.profit),
                            },
                            {
                                label: "Tax Rate",
                                value: `${yearly.tax_rate_percentage}%`,
                            },
                            {
                                label: "Yearly Tax (AFN)",
                                value: formatAFN(yearly.yearly_tax),
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="border-slate-200 md:px-3 md:not-first:border-l"
                            >
                                <p className="text-xs text-slate-500">{item.label}</p>
                                <p className="mt-2 text-lg font-bold text-slate-900">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
};

export default TaxReportsPage;
