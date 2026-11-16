import { useState } from "react";
import {
  createCashBalanceExchange,
  getLatestBalance,
} from "../../api/cashBalanceExchangeApi";
import { formatNumber } from "../../utils/formatNumber";

interface Props {
  maxUnallocatedUSD: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function ExchangeFormModal({
  maxUnallocatedUSD,
  onSuccess,
  onClose,
}: Props) {
  // ✅ Helper to get local YYYY-MM-DD
  const getTodayLocal = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const [amountInput, setAmountInput] = useState("");
  const [rateInput, setRateInput] = useState("");
  const [date, setDate] = useState(getTodayLocal());
  const [localSuccessMessage, setLocalSuccessMessage] = useState("");

  const formatInputValue = (value: string) => {
    const cleanValue = value.replace(/,/g, "").replace(/[^\d.]/g, "");

    const parts = cleanValue.split(".");
    const integerPart = parts[0];
    const decimalPart = parts.slice(1).join("");

    if (!integerPart && !cleanValue.includes(".")) return "";

    const formattedInteger = integerPart
      ? formatNumber(Number(integerPart))
      : "";

    return cleanValue.includes(".")
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };
  // API hooks
  const { create, loading: saving, error } = createCashBalanceExchange();
  const { data: latestBalance } = getLatestBalance();

  // Current Date info
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const minDate = formatLocalDate(new Date(currentYear, currentMonth, 1));
  const maxDate = formatLocalDate(new Date(currentYear, currentMonth + 1, 0));

  // ✅ Strict Date Validation (Blocks typing different months)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (!newDate) {
      setDate(newDate);
      return;
    }

    // Create a string for the current month (e.g., "2026-10")
    const currentMonthString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

    // If the typed date starts with the current year and month, allow it
    if (newDate.startsWith(currentMonthString)) {
      setDate(newDate);
    } else {
      // If they type a different month (like 11 or 09), ignore the change
      // and reset the input back to the valid state
      e.target.value = date;
    }
  };

  // Calculations
  const amountUSD = Number(amountInput.replace(/,/g, ""));
  const rate = Number(rateInput.replace(/,/g, ""));

  const validAmount =
    amountInput.trim() !== "" &&
    Number.isFinite(amountUSD) &&
    amountUSD > 0 &&
    amountUSD <= maxUnallocatedUSD;

  const validRate =
    rateInput.trim() !== "" && Number.isFinite(rate) && rate > 0;

  const amountAF = validAmount && validRate ? amountUSD * rate : 0;

  // Remainder Logic (Same Month vs New Month)
  let isNewMonth = false;
  let previousRemainder = 0;

  if (latestBalance && latestBalance.date && date) {
    const selectedDateObj = new Date(date);
    const latestBalanceDateObj = new Date(latestBalance.date);

    if (
      selectedDateObj.getFullYear() > latestBalanceDateObj.getFullYear() ||
      (selectedDateObj.getFullYear() === latestBalanceDateObj.getFullYear() &&
        selectedDateObj.getMonth() > latestBalanceDateObj.getMonth())
    ) {
      isNewMonth = true;
      previousRemainder = Number(latestBalance.remainder || 0);
    }
  }

  const remainder =
    validAmount && validRate
      ? isNewMonth
        ? amountAF + previousRemainder
        : amountAF
      : 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalSuccessMessage("");

    if (!validAmount || !validRate) return;

    const payload = {
      ex_rate: rate,
      amount_usd: amountUSD,
      amount_af: amountAF,
      date_of_exchange: date,
      cash_flow_and_remainder: remainder,
    };

    const success = await create(payload);

    if (success) {
      setLocalSuccessMessage("Exchange saved successfully!");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[95vh] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Exchange USD to AFN(allocate)
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {localSuccessMessage && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            {localSuccessMessage}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {isNewMonth && validAmount && validRate && (
          <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            <strong>New Month Detected!</strong> The system has automatically
            added the last remainder of {formatNumber(previousRemainder)} AFN to
            the cash flow.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Amount to Exchange (USD)
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Max available: ${formatNumber(maxUnallocatedUSD)}
            </p>
            <input
              type="text"
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => setAmountInput(formatInputValue(e.target.value))}
              placeholder="Enter amount in USD"
              required
              className="w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-firstRate outline-none"
            />
            {amountUSD > maxUnallocatedUSD && (
              <p className="mt-1 text-xs text-red-500">
                You have not enough money in to allocate.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Exchange Date
            </label>
            <input
              type="date"
              value={date}
              min={minDate}
              max={maxDate}
              onChange={handleDateChange} // ✅ Using the new strict handler
              required
              className="w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-firstRate outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              You can only pick a date within the current month.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Exchange Rate (AFN per USD)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={rateInput}
              onChange={(e) => setRateInput(formatInputValue(e.target.value))}
              placeholder="Enter exchange rate"
              required
              className="w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-firstRate outline-none"
            />
          </div>

          <div className="space-y-3 rounded-md bg-gray-50 p-4">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-600">Calculated AFN</span>
              <span className="font-semibold text-gray-900">
                {formatNumber(amountAF)} AFN
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-600">
                Cash Flow and +Remainder
              </span>
              <span className="font-semibold text-gray-900">
                {formatNumber(remainder)} AFN
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                saving || amountUSD > maxUnallocatedUSD || !!localSuccessMessage
              }
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
