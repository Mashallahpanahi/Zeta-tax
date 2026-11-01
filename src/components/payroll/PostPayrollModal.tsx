import { useState } from "react";
import { createPayroll, type EmployeeContract } from "../../api/payRollApi";
import { calculateTax } from "../../utils/calculateTax";
import { formatNumber } from "../../utils/formatNumber";

interface Props {
  isOpen: boolean;
  contract: EmployeeContract | null;
  date: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PostPayrollModal({
  isOpen,
  contract,
  date,
  onClose,
  onSuccess,
}: Props) {
  const { create, loading: saving, error } = createPayroll();

  const [overtime, setOvertime] = useState<string>("0");
  const [exRate, setExRate] = useState<string>("70");

  if (!isOpen || !contract) return null;

  const baseSalary = Number(contract.base_salary || 0);
  const bonus = Number(overtime) || 0;
  const rateNum = Number(exRate) || 0;

  // 1. Total USD (Base + Overtime)
  const totalUSD = baseSalary + bonus;

  // 2. Total AFN (Convert USD to AFN using the rate)
  const totalAFN = totalUSD * rateNum;

  // 3. ✅ Pass the AFN amount to the utility function
  const taxResult = calculateTax(totalAFN);

  // 4. Extract raw numbers from the formatted string (e.g., "2,800" -> 2800)
  const taxAmountAFN = Number(taxResult.tax.replace(/,/g, ""));
  const finalSalaryAFN = Number(taxResult.amountAfterTax.replace(/,/g, ""));

  // 5. ✅ Convert the AFN tax back to USD for the backend payload
  const taxAmountUSD = rateNum > 0 ? taxAmountAFN / rateNum : 0;
  const finalSalaryUSD = rateNum > 0 ? finalSalaryAFN / rateNum : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract.contract_id) return;

    // ✅ Exact payload matching your JSON response
    const payload = {
      contract_id: contract.contract_id,
      base_salary: baseSalary,
      salary_usd: baseSalary, // Matches JSON: salary_usd is just base_salary
      salary_afn: baseSalary * rateNum, // Matches JSON: salary_afn is base_salary * rate
      ex_rate: rateNum,
      overtime_bonus: bonus,
      date: date,
      tax: taxAmountUSD, // Send USD to backend (e.g., 40)
      final_salary: finalSalaryUSD, // Send USD to backend (e.g., 360)
      pay_status: true,
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

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Base Salary (USD)</span>
              <span className="font-semibold text-gray-800">
                ${formatNumber(baseSalary)}
              </span>
            </div>
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
          </div>

          <div className="bg-blue-50 p-4 rounded-lg space-y-3 border border-blue-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Salary (USD)</span>
              <span className="font-semibold text-blue-firstRate">
                ${formatNumber(totalUSD)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Salary (AFN)</span>
              <span className="font-semibold text-blue-firstRate">
                {formatNumber(totalAFN)} AFN
              </span>
            </div>

            <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
              <span className="text-gray-600">Tax ({taxResult.taxRate}%)</span>
              {/* ✅ Show exactly 2,800 AFN / $40 USD */}
              <div className="text-right">
                <span className="font-semibold text-red-500">
                  -{taxResult.tax} AFN
                </span>
                <span className="block text-xs text-gray-500">
                  (-${formatNumber(taxAmountUSD)})
                </span>
              </div>
            </div>

            <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
              <span className="font-bold text-gray-800">Final Salary</span>
              {/* ✅ Show exactly 25,200 AFN / $360 USD */}
              <div className="text-right">
                <span className="font-bold text-green-700">
                  {taxResult.amountAfterTax} AFN
                </span>
                <span className="block text-xs text-green-600 font-semibold">
                  (${formatNumber(finalSalaryUSD)})
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
              disabled={saving || rateNum <= 0}
              className="px-4 py-2 text-sm text-white bg-blue-firstRate rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Processing..." : "Pay Salary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
