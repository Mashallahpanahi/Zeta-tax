import { useState, useEffect } from "react";
import { createTax, updateTax, type TaxType } from "../../api/taxApi";

interface Props {
  isOpen: boolean;
  existingData: TaxType | null;
  onClose: () => void;
  onSuccess: () => void;
}

// ✅ Store inputs as empty strings by default, not 0
const emptyForm = {
  quarterly: "",
  yearly: "",
  salary_range_under_10k: "",
  salary_range_above_10k: "",
  salary_range_above_100k: "",
  rent_under_10k: "",
  rent_above_10k: "",
  rent_above_100k: "",
};

export default function TaxFormModal({
  isOpen,
  existingData,
  onClose,
  onSuccess,
}: Props) {
  const { create, loading: creating, error: createError } = createTax();
  const { update, loading: updating, error: updateError } = updateTax();

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) {
      if (existingData) {
        // Convert "4.00" -> "4" so the input looks clean
        setForm({
          quarterly: String(Number(existingData.quarterly)),
          yearly: String(Number(existingData.yearly)),
          salary_range_under_10k: String(Number(existingData.salary_range_under_10k)),
          salary_range_above_10k: String(Number(existingData.salary_range_above_10k)),
          salary_range_above_100k: String(Number(existingData.salary_range_above_100k)),
          rent_under_10k: String(Number(existingData.rent_under_10k)),
          rent_above_10k: String(Number(existingData.rent_above_10k)),
          rent_above_100k: String(Number(existingData.rent_above_100k)),
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [isOpen, existingData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Just store the raw string while typing
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Convert strings back to numbers for the API
    const payload = {
      quarterly: Number(form.quarterly) || 0,
      yearly: Number(form.yearly) || 0,
      salary_range_under_10k: Number(form.salary_range_under_10k) || 0,
      salary_range_above_10k: Number(form.salary_range_above_10k) || 0,
      salary_range_above_100k: Number(form.salary_range_above_100k) || 0,
      rent_under_10k: Number(form.rent_under_10k) || 0,
      rent_above_10k: Number(form.rent_above_10k) || 0,
      rent_above_100k: Number(form.rent_above_100k) || 0,
    };

    let ok = false;
    if (existingData?.tax_id) {
      ok = await update(existingData.tax_id, payload);
    } else {
      ok = await create(payload);
    }

    if (ok) {
      onSuccess();
      onClose();
    }
  };

  const inputClass =
    "border border-gray-300 px-3 py-2 text-sm rounded-lg w-full " +
    "focus:outline-none focus:ring-2 focus:ring-blue-firstRate/40 " +
    "focus:border-blue-firstRate transition";

  const labelClass = "text-sm font-medium text-gray-700 mb-1 block";
  const error = createError || updateError;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-blue-firstRate">
            {existingData ? "Update Tax Configuration" : "Create Tax Configuration"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">
            ✕
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-500">Error: {error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Quarterly (%)</label>
              <input
                name="quarterly"
                type="number"
                step="0.01"
                placeholder="0"
                value={form.quarterly}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Yearly (%)</label>
              <input
                name="yearly"
                type="number"
                step="0.01"
                placeholder="0"
                value={form.yearly}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Salary */}
          <div>
            <h3 className="text-sm font-semibold text-blue-firstRate mb-3 border-b pb-1">
              Salary Ranges
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Under 10k (%)</label>
                <input
                  name="salary_range_under_10k"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={form.salary_range_under_10k}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>10k - 100k (%)</label>
                <input
                  name="salary_range_above_10k"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={form.salary_range_above_10k}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Above 100k (%)</label>
                <input
                  name="salary_range_above_100k"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={form.salary_range_above_100k}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          {/* Rent */}
          <div>
            <h3 className="text-sm font-semibold text-blue-firstRate mb-3 border-b pb-1">
              Rent Ranges
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Under 10k (%)</label>
                <input
                  name="rent_under_10k"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={form.rent_under_10k}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>10k - 100k (%)</label>
                <input
                  name="rent_above_10k"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={form.rent_above_10k}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Above 100k (%)</label>
                <input
                  name="rent_above_100k"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={form.rent_above_100k}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 text-sm rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || updating}
              className="bg-blue-firstRate hover:bg-blue-firstRate/90 text-white px-4 py-2 text-sm rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {creating || updating ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}