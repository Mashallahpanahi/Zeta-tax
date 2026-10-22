import { useState } from "react";
import { createIncomeTransaction } from "../../api/incomeTransactionApi";
import IncomeFormFields, { createEmptyForm, type IncomeForm } from "./IncomeFormFields";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddIncomeModal({ isOpen, onClose, onSuccess }: Props) {
  const { create, loading, error } = createIncomeTransaction();
  const [form, setForm] = useState<IncomeForm>(createEmptyForm());
  const [localError, setLocalError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!form.amount || Number(form.amount) <= 0) {
      setLocalError("Please enter an amount greater than zero.");
      return;
    }

    const payload = {
      date: form.date,
      amount: Number(form.amount),
      currency: form.currency,
      recorded_by: form.recorded_by.trim(),
      received_from: form.received_from.trim(),
      income_type: form.income_type,
      description: form.description.trim(),
      used: false,
    };

    const success = await create(payload);
    if (success) {
      setForm(createEmptyForm()); // Reset form on success
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
        <h2 className="mb-2 text-lg font-bold">Add Income Transaction</h2>
        <p className="mb-5 text-sm text-gray-500">Enter the details of the new income transaction.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <IncomeFormFields form={form} onChange={(f, v) => setForm({ ...form, [f]: v })} />

          {(localError || error) && (
            <p className="whitespace-pre-wrap text-sm text-red-500">{localError || error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-firstRate px-4 py-2 text-white hover:opacity-90 disabled:opacity-50">
              {loading ? "Adding..." : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}