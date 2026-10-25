import { useState } from "react";
import {
  createCashBalanceExchange,
  getLatestBalance,
} from "../../api/cashBalanceExchangeApi";
import { formatNumber } from "../../utils/formatNumber";

interface Props {
  maxUnallocatedUSD: number;
  onSuccess: () => void; // ✅ Changed from onSave to onSuccess
  onClose: () => void;
}

export default function ExchangeFormModal({
  maxUnallocatedUSD,
  onSuccess,
  onClose,
}: Props) {
  const [amountInput, setAmountInput] = useState("");
  const [rateInput, setRateInput] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [localSuccessMessage, setLocalSuccessMessage] = useState("");

  // ✅ Use the API hook directly inside the modal
  const { create, loading: saving, error } = createCashBalanceExchange();

  // ✅ Fetch Latest Balance for Remainder Logic
  const { data: latestBalance } = getLatestBalance();

  // ✅ Date Restrictions (Current Month Only)
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const minDate = new Date(currentYear, currentMonth, 1)
    .toISOString()
    .split("T")[0];
  const maxDate = new Date(currentYear, currentMonth + 1, 0)
    .toISOString()
    .split("T")[0];

  // Calculations
  const amountUSD = Number(amountInput);
  const rate = Number(rateInput);

  const validAmount =
    amountInput.trim() !== "" &&
    Number.isFinite(amountUSD) &&
    amountUSD > 0 &&
    amountUSD <= maxUnallocatedUSD;

  const validRate =
    rateInput.trim() !== "" && Number.isFinite(rate) && rate > 0;

  const amountAF = validAmount && validRate ? amountUSD * rate : 0;

  // ✅ Remainder Logic (Same Month vs New Month)
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

    // ✅ EXACT PAYLOAD MATCHING SWAGGER
    const payload = {
      ex_rate: rate,
      amount_usd: amountUSD,
      amount_af: amountAF,
      date_of_exchange: date,
      cash_flow_and_remainder: remainder,
    };

    const success = await create(payload);

    if (success) {
      // Show the backend success message inside the popup
      setLocalSuccessMessage("Exchange saved successfully!");

      // Wait 1.5 seconds so the user can read the message, then close & refresh
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
            Exchange USD to AFN
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

        {/* ✅ Show Backend Success Message */}
        {localSuccessMessage && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            {localSuccessMessage}
          </div>
        )}

        {/* ✅ Show Backend Error Message */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Alert if New Month */}
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
              type="number"
              min="0.01"
              max={maxUnallocatedUSD}
              step="0.01"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
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
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 p-2.5 text-gray-900 focus:border-blue-firstRate outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Exchange Rate (AFN per USD)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
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
                Cash Flow and Remainder
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
