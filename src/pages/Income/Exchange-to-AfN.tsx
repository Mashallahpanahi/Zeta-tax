
import { useMemo, useState } from "react";

import { getAllIncomeTransactions } from "../../api/incomeTransactionApi";
import {
    createCashBalanceExchange,
    getAllCashBalanceExchanges,
    type CashBalanceExchange,
} from "../../api/cashBalanceExchangeApi";
import { getAllOtherExpenses } from "../../api/otherExpenseApi";

import ExchangeFormModal from "../../components/income/ExchangeFormModal";
import { formatNumber } from "../../utils/formatNumber";

const localDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const currentMonthString = (): string => {
    return localDateString(new Date()).slice(0, 7);
};

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

const getExchangeRateForExpense = (
    expenseDate: string,
    exchanges: CashBalanceExchange[],
): number => {
    const datedExchanges = exchanges
        .filter((exchange) => {
            const exchangeDate = String(
                exchange.date_of_exchange ?? "",
            ).slice(0, 10);

            return exchangeDate && exchangeDate <= expenseDate;
        })
        .sort((a, b) => {
            const dateA = String(a.date_of_exchange ?? "").slice(0, 10);
            const dateB = String(b.date_of_exchange ?? "").slice(0, 10);

            return dateB.localeCompare(dateA);
        });

    if (datedExchanges.length > 0) {
        return Number(datedExchanges[0].ex_rate ?? 0);
    }

    const sameMonthExchanges = exchanges
        .filter(
            (exchange) =>
                String(exchange.date_of_exchange ?? "").slice(0, 7) ===
                expenseDate.slice(0, 7),
        )
        .sort((a, b) =>
            String(b.date_of_exchange ?? "")
                .slice(0, 10)
                .localeCompare(
                    String(a.date_of_exchange ?? "").slice(0, 10),
                ),
        );

    return Number(sameMonthExchanges[0]?.ex_rate ?? 0);
};

const getIncomeAmount = (income: Record<string, unknown>): number => {
    return Number(income.amount_of ?? income.amount ?? 0);
};

const getExpenseDate = (expense: Record<string, unknown>): string => {
    return String(expense.expense_date ?? "").slice(0, 10);
};

const getExpenseAmount = (expense: Record<string, unknown>): number => {
    return Number(expense.amount ?? 0);
};

const getExpenseCurrency = (expense: Record<string, unknown>): string => {
    return String(expense.currency ?? "").toUpperCase();
};

export default function ExchangeToAFNPage() {
    const { data: incomesData, refetch: refetchIncomes } =
        getAllIncomeTransactions();
    const incomes = incomesData ?? [];

    const {
        data: exchangesData,
        refetch: refetchExchanges,
    } = getAllCashBalanceExchanges();

    const exchanges = exchangesData ?? [];
    const { create: createExchange, loading: isCreating } =
        createCashBalanceExchange();

    const { data: expensesData } = getAllOtherExpenses();

    const expenses = expensesData ?? [];

    const [selectedMonth, setSelectedMonth] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState("");

    const sortedExchanges = useMemo(
        () =>
            [...exchanges].sort((a, b) =>
                String(b.date_of_exchange ?? "").localeCompare(
                    String(a.date_of_exchange ?? ""),
                ),
            ),
        [exchanges],
    );

    const displayedExchanges = useMemo(() => {
        if (selectedMonth === "all") return sortedExchanges;

        return sortedExchanges.filter(
            (exchange) =>
                String(exchange.date_of_exchange ?? "").slice(0, 7) ===
                selectedMonth,
        );
    }, [selectedMonth, sortedExchanges]);

    const totalIncomeUSD = useMemo(
        () =>
            incomes.reduce(
                (total, income) =>
                    total +
                    getIncomeAmount(income as Record<string, unknown>),
                0,
            ),
        [incomes],
    );

    const totalExchangedUSD = useMemo(
        () =>
            exchanges.reduce((total, exchange) => {
                const rate = Number(exchange.ex_rate ?? 0);

                if (rate <= 0) return total;

                return total + Number(exchange.amount_af ?? 0) / rate;
            }, 0),
        [exchanges],
    );

    const unallocatedUSD = Math.max(
        0,
        totalIncomeUSD - totalExchangedUSD,
    );

    const totalAFN = useMemo(
        () =>
            displayedExchanges.reduce(
                (total, exchange) =>
                    total + Number(exchange.amount_af ?? 0),
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

    const expenseTotals = useMemo(() => {
        const targetMonth =
            selectedMonth === "all"
                ? currentMonthString()
                : selectedMonth;

        let afn = 0;
        let unconvertedUSD = 0;

        for (const item of expenses) {
            const expense = item as unknown as Record<string, unknown>; const date = getExpenseDate(expense);

            if (date.slice(0, 7) !== targetMonth) continue;

            const amount = getExpenseAmount(expense);
            const currency = getExpenseCurrency(expense);

            if (currency === "AFN") {
                afn += amount;
            } else if (currency === "USD") {
                const rate = getExchangeRateForExpense(date, exchanges);

                if (rate > 0) {
                    afn += amount * rate;
                } else {
                    unconvertedUSD += amount;
                }
            }
        }

        return { afn, unconvertedUSD, targetMonth };
    }, [expenses, exchanges, selectedMonth]);

    const availableMonths = useMemo(() => {
        const months = new Set<string>();

        for (const exchange of exchanges) {
            const month = String(
                exchange.date_of_exchange ?? "",
            ).slice(0, 7);

            if (month) months.add(month);
        }

        return [...months].sort((a, b) => b.localeCompare(a));
    }, [exchanges]);

    const handleExchangeCreated = () => {
        setIsModalOpen(false);
        setMessage("Exchange saved successfully.");
        refetchExchanges();
        refetchIncomes();
    };

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Monthly Invoice Allocation
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Track income exchanges, expenses, and remaining cash.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-lg bg-blue-firstRate px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    Exchange USD to AFN
                </button>
            </div>

            {message && (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <span>{message}</span>
                    <button
                        type="button"
                        onClick={() => setMessage("")}
                        className="ml-3 font-semibold"
                        aria-label="Dismiss message"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Total Income Received
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        ${formatNumber(totalIncomeUSD)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        Across all months
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Total AFN Exchanged
                    </p>
                    <p className="mt-2 text-2xl font-bold text-green-700">
                        ؋
                        {formatNumber(
                            exchanges.reduce(
                                (total, exchange) =>
                                    total + Number(exchange.amount_af ?? 0),
                                0,
                            ),
                        )}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        Across all months
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Unallocated Income
                    </p>
                    <p className="mt-2 text-2xl font-bold text-amber-600">
                        ${formatNumber(unallocatedUSD)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        Income not yet exchanged
                    </p>
                </div>
            </div>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Exchange History
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Review exchanged income by month or view all records.
                        </p>
                    </div>

                    <select
                        value={selectedMonth}
                        onChange={(event) =>
                            setSelectedMonth(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
                        aria-label="Filter exchange history by month"
                    >
                        <option value="all">All Months</option>
                        {availableMonths.map((month) => (
                            <option key={month} value={month}>
                                {new Date(
                                    `${month}-01T00:00:00`,
                                ).toLocaleDateString("en-US", {
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
                                <th className="px-5 py-3 font-semibold">
                                    Exchange Date
                                </th>
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
                                    const amountAFN = Number(
                                        exchange.amount_af ?? 0,
                                    );
                                    const amountUSD =
                                        rate > 0 ? amountAFN / rate : 0;

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
                                                    String(
                                                        exchange.date_of_exchange ??
                                                        "",
                                                    ),
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

                <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                        {selectedMonth === "all"
                            ? "Grand Total — All Months"
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


            {isModalOpen && (
                <ExchangeFormModal
                    incomes={incomes}
                    onClose={() => setIsModalOpen(false)}
                    onSave={async (values) => {
                        const success = await createExchange({
                            date_of_exchange: values.date,
                            ex_rate: values.rate,
                            amount_usd: values.amountUSD,
                            amount_af: values.amountAF,
                            cash_flow_and_remainder: values.remainder,
                            received_income_transaction_id:
                                values.income.income_id,
                        });

                        if (success) {
                            handleExchangeCreated();
                        }
                    }}
                />
            )}
        </div>
    );
}
