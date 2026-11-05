import { useState, useEffect } from "react";
import { createPayroll, type EmployeeContract } from "../../api/payRollApi";
import { calculateTax } from "../../utils/calculateTax";
import { formatNumber } from "../../utils/formatNumber";
import { dollarToAfghani } from "../../utils/dollarToAfghani";

interface Props {
  isOpen: boolean;
  contract: EmployeeContract | null;
  date: string;
  defaultExRate: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PostPayrollModal({
  isOpen,
  contract,
  date,
  defaultExRate,
  onClose,
  onSuccess,
}: Props) {
  const { create, loading: saving, error } = createPayroll();

  const [baseSalaryInput, setBaseSalaryInput] = useState<string>("0");
  const [overtime, setOvertime] = useState<string>("0");
  const [exRate, setExRate] = useState<string>("70");

  // ✅ Sync the state when the contract changes or modal opens
  useEffect(() => {
    if (isOpen && contract) {
      setBaseSalaryInput(String(contract.base_salary || 0));
      setOvertime("0");

      // ✅ Load the exchange rate from localStorage
      const storedRate = localStorage.getItem("global_exchange_rate");
      setExRate(storedRate || "70");
    }
  }, [isOpen, contract]);

  if (!isOpen || !contract) return null;

  // Date Validation: Only allow paying for the CURRENT month
  const today = new Date();
  const currentMonthStr = today.toISOString().slice(0, 7);
  const selectedMonthStr = date.slice(0, 7);
  const isCurrentMonth = currentMonthStr === selectedMonthStr;

  // Use the editable state
  const baseSalary = Number(baseSalaryInput) || 0;
  const bonus = Number(overtime) || 0;
  const rateNum = Number(exRate) || 0;

  // 1. Total USD (Base + Overtime)
  const totalUSD = baseSalary + bonus;

  // 2. Total AFN (Numeric for Payload and Tax calculation)
  const totalAFN = Number((totalUSD * rateNum).toFixed(2));

  // 3. Calculate Tax (Based on AFN)
  const taxResult = calculateTax(totalAFN);

  // 4. Extract raw numbers from the formatted string (e.g., "2,800" -> 2800)
  const taxAmountAFN = Number(taxResult.tax.replace(/,/g, ""));
  const finalSalaryAFN = Number(taxResult.amountAfterTax.replace(/,/g, ""));

  // 5. For UI display only, show the USD equivalent of the tax/final salary
  const taxAmountUSD = rateNum > 0 ? taxAmountAFN / rateNum : 0;
  const finalSalaryUSD = rateNum > 0 ? finalSalaryAFN / rateNum : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCurrentMonth) return;
    if (!contract.contract_id) return;

    // ✅ Payload now sends the exact AFN values for tax and final_salary based on your instructions
    const payload = {
      contract_id: contract.contract_id,
      base_salary: baseSalary,
      salary_usd: baseSalary,             // Matches your example JSON exactly
      salary_afn: totalAFN,               // Calculated from (base + overtime) * rate
      ex_rate: rateNum,
      overtime_bonus: bonus,
      date: date,
      tax: taxAmountAFN,                  // Send AFN value
      final_salary: finalSalaryAFN,       // Send AFN value
      pay_status: true,                   // (Change to false if your backend expects it false initially)
    };

    const success = await create(payload);
    if (success) {
      onSuccess();
      onClose();
    }
  };

  const displayDate = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-1">
          Pay Salary: {contract.employee?.first_name}{" "}
          {contract.employee?.last_name}
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Payment Period:{" "}
          <span className="font-semibold text-gray-800">{displayDate}</span>
        </p>

        {!isCurrentMonth && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 font-medium">
            ⚠️ You can only pay for the current month (
            {today.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
            ).
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Salary (USD)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={baseSalaryInput}
              onChange={(e) => setBaseSalaryInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-firstRate font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Overtime / Bonus (USD)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={overtime}
              onChange={(e) => setOvertime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-firstRate"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exchange Rate (AFN per USD)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={exRate}
              onChange={(e) => setExRate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-firstRate"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can adjust this rate specifically for this employee.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg space-y-2 border border-blue-100 text-sm">
            <h3 className="font-semibold text-blue-900 mb-2 border-b border-blue-200 pb-1">
              Payload Summary
            </h3>

            <div className="flex justify-between">
              <span className="text-gray-600">Base Salary (USD)</span>
              <span className="font-medium">${formatNumber(baseSalary)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Total (AFN)</span>
              <span className="font-medium">
                {dollarToAfghani(totalUSD, rateNum)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Overtime Bonus (USD)</span>
              <span className="font-medium">${formatNumber(bonus)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Exchange Rate</span>
              <span className="font-medium">{formatNumber(rateNum)}</span>
            </div>

            <div className="flex justify-between pt-2 border-t border-blue-200">
              <span className="text-gray-600">Tax ({taxResult.taxRate}%)</span>
              <div className="text-right">
                <span className="font-semibold text-red-500">
                  {formatNumber(taxAmountAFN)} AFN
                </span>
                <span className="block text-xs text-gray-500">
                  (${formatNumber(taxAmountUSD)} USD)
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-blue-200">
              <span className="font-bold text-gray-800">Final Salary</span>
              <div className="text-right">
                <span className="font-bold text-green-700">
                  {formatNumber(finalSalaryAFN)} AFN
                </span>
                <span className="block text-xs text-green-600 font-semibold">
                  (${formatNumber(finalSalaryUSD)} USD)
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || rateNum <= 0 || !isCurrentMonth}
              className="px-4 py-2 text-sm text-white bg-blue-firstRate rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Processing..." : "Pay Salary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}