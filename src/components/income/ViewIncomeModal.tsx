import { type IncomeTransactionType } from "../../api/incomeTransactionApi";
import { formatNumber } from "../../utils/formatNumber";

interface Props {
  isOpen: boolean;
  transaction: IncomeTransactionType | null;
  onClose: () => void;
}

const DETAIL_FIELDS = [
  ["date", "Date"],
  ["amount", "Amount"],
  ["currency", "Currency"],
  ["recorded_by", "Recorded By"],
  ["received_from", "Received From"],
  ["income_type", "Income Type"],
  ["description", "Description"],
  ["used", "Used"],
] as const;

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function ViewIncomeModal({ isOpen, transaction, onClose }: Props) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
            <p className="mt-1 text-sm text-gray-500">View income transaction information</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-xl font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900">×</button>
        </div>

        <div className="max-h-[calc(85vh-90px)] overflow-y-auto p-5 sm:p-6">
          <div className="space-y-4">
            {DETAIL_FIELDS.map(([key, label]) => (
              <div key={key} className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-4">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="break-words text-sm leading-6 text-gray-600 sm:col-span-2">
                  {key === "amount" && Number.isFinite(Number(transaction[key]))
                    ? formatNumber(Number(transaction[key]))
                    : formatValue(transaction[key])}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
            <button onClick={onClose} className="rounded-lg bg-blue-firstRate px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}