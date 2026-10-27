import { useState, useEffect } from "react";
import { updateIncomeTransaction, type IncomeTransactionType } from "../../api/incomeTransactionApi";
import IncomeFormFields, { type IncomeForm } from "./IncomeFormFields";

interface Props {
  isOpen: boolean;
  transaction: IncomeTransactionType | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditIncomeModal({ isOpen, transaction, onClose, onSuccess }: Props) {
  const { update, loading, error } = updateIncomeTransaction();
  const [form, setForm] = useState<IncomeForm | null>(null);
  const [localError, setLocalError] = useState("");

  // Fill the form when the modal opens with the selected transaction data
  useEffect(() => {
    if (isOpen && transaction) {
      setForm({
        date: String(transaction.date ?? "").slice(0, 10),
        amount: String(transaction.amount ?? ""),
        currency: String(transaction.currency ?? "USD"),
        recorded_by: String(transaction.recorded_by ?? ""),
        received_from: String(transaction.received_from ?? ""),
        income_type: String(transaction.income_type ?? "Monthly"),
        description: String(transaction.description ?? ""),
      });
      setLocalError("");
    }
  }, [isOpen, transaction]);

  if (!isOpen || !transaction || !form) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Safely get the ID
    const id = transaction.income_id ?? transaction.id ?? transaction.transaction_id ?? transaction._id;
    if (!id) {
      setLocalError("Transaction ID was not found.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setLocalError("Please enter an amount greater than zero.");
      return;
    }

    const payload = {
      ...transaction,
      date: form.date,
      amount: Number(form.amount),
      currency: form.currency,
      recorded_by: form.recorded_by.trim(),
      received_from: form.received_from.trim(),
      income_type: form.income_type,
      description: form.description.trim(),
    };

    // Clean payload before sending to backend
    delete payload.id;
    delete payload.income_id;
    delete payload.transaction_id;
    delete payload._id;
    delete payload.created_at;
    delete payload.updated_at;

    const success = await update(String(id), payload);
    if (success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
        <h2 className="mb-2 text-lg font-bold">Edit Income Transaction</h2>
        <p className="mb-5 text-sm text-gray-500">Update the transaction details using the fields below.</p>

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
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}