import { useEffect, useState, type FormEvent } from "react";
import type { OfficeRent, OfficeRentPayload } from "../../api/officeRentApi";
import { updateOfficeRent } from "../../api/officeRentApi";
import { calculateRentTax, loadTaxRates } from "../../utils/calculateTax";
import { formatNumber as formatNumberUtil } from "../../utils/formatNumber";
import { FaTimes, FaSave } from "react-icons/fa";

interface OfficeRentEditModalProps {
  rent: OfficeRent | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
}

const formatNumber = (value: number | string | null | undefined) =>
  Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const parseTax = (value: string) => Number(value.replace(/,/g, "")) || 0;

const OfficeRentEditModal = ({
  rent,
  isOpen,
  onClose,
  onUpdated,
}: OfficeRentEditModalProps) => {
  const updateMutation = updateOfficeRent();

  const [amount, setAmount] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [date, setDate] = useState("");
  const [paid, setPaid] = useState(false);
  const [taxReady, setTaxReady] = useState(false);
  const [error, setError] = useState("");
  const [loadingRates, setLoadingRates] = useState(false);

  useEffect(() => {
    if (!isOpen || !rent) return;

    const initialAmount = Number(rent.amount_af) || 0;
    setAmount(String(rent.amount_af ?? ""));
    setAmountDisplay(initialAmount ? formatNumberUtil(initialAmount) : "");
    setDate(String(rent.date).slice(0, 10));
    setPaid(Boolean(rent.paid));
    setError("");
    setTaxReady(false);

    let active = true;

    const fetchRates = async () => {
      setLoadingRates(true);

      try {
        await loadTaxRates();

        if (active) {
          setTaxReady(true);
        }
      } catch {
        if (active) {
          setError("Unable to load rent tax rates.");
        }
      } finally {
        if (active) {
          setLoadingRates(false);
        }
      }
    };

    fetchRates();

    return () => {
      active = false;
    };
  }, [isOpen, rent]);

  if (!isOpen || !rent) {
    return null;
  }

  const numericAmount = Number(amount) || 0;
  const taxResult = calculateRentTax(numericAmount);
  const taxAmount = taxReady && numericAmount > 0 ? parseTax(taxResult.tax) : 0;

  const finalPayment = numericAmount - taxAmount;

  const handleAmountChange = (val: string) => {
    const rawValue = val.replace(/,/g, "");

    // Regex allows only numbers and a single optional decimal point
    if (rawValue === "" || /^\d*\.?\d*$/.test(rawValue)) {
      // Format the integer part with commas, but preserve the decimal part
      const parts = rawValue.split(".");
      parts[0] = formatNumberUtil(Number(parts[0]) || 0);

      setAmountDisplay(parts.join("."));
      setAmount(rawValue);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!amount || numericAmount <= 0) {
      setError("Please enter a rent amount greater than zero.");
      return;
    }

    if (!date) {
      setError("Please select the rent date.");
      return;
    }

    if (!taxReady) {
      setError("Rent tax rates are not ready. Please wait.");
      return;
    }

    try {
      await loadTaxRates();
    } catch {
      setError("Unable to load the latest rent tax rates.");
      return;
    }

    const latestTaxResult = calculateRentTax(numericAmount);
    const latestTaxAmount = parseTax(latestTaxResult.tax);

    const payload: OfficeRentPayload = {
      amount_af: numericAmount,
      date,
      tax_amount_af: latestTaxAmount,
      final_pay_af: numericAmount - latestTaxAmount,
      paid,
    };

    try {
      const success = await updateMutation.update(
        String(rent.rent_id),
        payload,
      );

      if (success) {
        await onUpdated();
        onClose();
      } else {
        setError(updateMutation.error || "Unable to update office rent.");
      }
    } catch {
      setError("Something went wrong while updating office rent.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-office-rent-title"
        className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2
              id="edit-office-rent-title"
              className="text-xl font-bold text-slate-900"
            >
              Edit Office Rent
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update rent payment details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="edit-rent-amount"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Rent Amount (AFN)
            </label>

            <input
              id="edit-rent-amount"
              type="text"
              required
              value={amountDisplay}
              onChange={(event) => handleAmountChange(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="edit-rent-date"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Rent Date
            </label>

            <input
              id="edit-rent-date"
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-slate-500">Rent Amount</p>
              <p className="mt-1 font-bold text-slate-900">
                AFN {formatNumber(numericAmount)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Tax ({taxResult.taxRate}%)
              </p>
              <p className="mt-1 font-bold text-amber-600">
                AFN {formatNumber(taxAmount)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Final Payment
              </p>
              <p className="mt-1 font-bold text-emerald-700">
                AFN {formatNumber(finalPayment)}
              </p>
            </div>
          </div>

          {loadingRates && (
            <p className="text-xs text-slate-500">Loading rent tax rates...</p>
          )}

          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={paid}
              onChange={(event) => setPaid(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Rent has been paid
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateMutation.loading || !taxReady}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSave />
              {updateMutation.loading ? "Updating..." : "Update Rent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfficeRentEditModal;
