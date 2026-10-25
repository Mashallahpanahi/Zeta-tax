
import { useState } from "react";
import type { ReceivedIncomeTransaction } from "../../api/cashBalanceExchangeApi";
import { formatNumber } from "../../utils/formatNumber";

interface IncomeOption {
    income_id?: number;
    id?: number;
    amount_of: number;
    amount_used?: number;
    used?: boolean;
    currency?: string;
    com_transaction_id?: number;
}

interface Props {
    incomes: IncomeOption[];
    onSave: (values: {
        income: ReceivedIncomeTransaction;
        date: string;
        rate: number;
        amountUSD: number;
        amountAF: number;
        remainder: number;
    }) => Promise<void>;
    onClose: () => void;
}

export default function ExchangeFormModal({
    incomes,
    onSave,
    onClose,
}: Props) {
    const [amountInput, setAmountInput] = useState("");
    const [rateInput, setRateInput] = useState("");
    const [date, setDate] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");



    // Use an available income internally because the API requires its ID.
    const incomeOption = incomes.find(
        (item) => (item.income_id ?? item.id) != null
    );

    const incomeId = incomeOption?.income_id ?? incomeOption?.id;

    const amountUSD = Number(amountInput);
    const rate = Number(rateInput);

    const validAmount =
        amountInput.trim() !== "" &&
        Number.isFinite(amountUSD) &&
        amountUSD > 0;

    const validRate =
        rateInput.trim() !== "" &&
        Number.isFinite(rate) &&
        rate > 0;

    const amountAF =
        validAmount && validRate ? amountUSD * rate : 0;


    // Only show a calculated remainder after both inputs are valid.
    const remainder =
        validAmount && validRate
            ? amountAF
            : 0;

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setErrorMessage("");

        if (!validAmount) {
            setErrorMessage("Enter a USD amount greater than zero.");
            return;
        }

        if (!validRate) {
            setErrorMessage("Enter a valid exchange rate.");
            return;
        }

        if (incomeId == null) {
            setErrorMessage(
                "No income transaction ID is available. The exchange API requires an income transaction."
            );
            return;
        }

        setSaving(true);

        try {
            await onSave({
                income: {
                    income_id: incomeId,
                    amount_of: Number(incomeOption?.amount_of ?? 0),
                    amount_used: Number(incomeOption?.amount_used ?? 0),
                    currency: incomeOption?.currency,
                    used: incomeOption?.used,
                    com_transaction_id:
                        incomeOption?.com_transaction_id,
                },
                date,
                rate,
                amountUSD,
                amountAF,
                remainder,
            });
        } catch {
            setErrorMessage("Could not save the exchange.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Exchange USD to AFN
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">
                    Enter the USD amount you want to exchange.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="amountUSD"
                            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Amount to Exchange (USD)
                        </label>

                        <input
                            id="amountUSD"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={amountInput}
                            onChange={(event) =>
                                setAmountInput(event.target.value)
                            }
                            placeholder="Enter amount in USD"
                            required
                            className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="exchangeDate"
                            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Exchange Date
                        </label>

                        <input
                            id="exchangeDate"
                            type="date"
                            value={date}
                            onChange={(event) =>
                                setDate(event.target.value)
                            }
                            required
                            className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="exchangeRate"
                            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Exchange Rate (AFN per USD)
                        </label>

                        <input
                            id="exchangeRate"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={rateInput}
                            onChange={(event) =>
                                setRateInput(event.target.value)
                            }
                            placeholder="Enter exchange rate"
                            required
                            className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    <div className="space-y-3 rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                        <div className="flex justify-between gap-4">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                Calculated AFN
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {formatNumber(amountAF)} AFN
                            </span>
                        </div>

                        <div className="flex justify-between gap-4">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                Cash Flow and Remainder
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {formatNumber(remainder)} AFN
                            </span>
                        </div>
                    </div>

                    {errorMessage && (
                        <p className="text-sm text-red-600" role="alert">
                            {errorMessage}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-md bg-blue-firstRate px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Exchange"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
