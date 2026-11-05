import { useState, useEffect } from "react";
import { createEmployee, type CreateEmployeeType } from "../../api/employeeApi";
import ResponsivePage from "../common/ResponsivePage";
// ✅ status is always "active" by default for new registrations
const emptyForm: CreateEmployeeType = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "",
  status: "active",
  phone: "",
  email: "",
  address: "",
  national_id: "",
  tin: "",
  bank_account: "",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterNewEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { create, loading, error } = createEmployee();
  const [form, setForm] = useState<CreateEmployeeType>(emptyForm);

  useEffect(() => {
    if (isOpen) setForm(emptyForm);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "tin" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // status stays "active" — no form field for it
    const ok = await create({ ...form, status: "active" });
    if (ok) {
      onSuccess();
      onClose();
    }
  };

  const inputClass =
    "border border-gray-300 px-3 py-1.5 text-sm rounded-lg " +
    "focus:outline-none focus:ring-2 focus:ring-blue-firstRate/40 " +
    "focus:border-blue-firstRate transition";

  const labelClass = "text-xs text-gray-600 mb-1 block";


  //<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-5">
      <div className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
          {/* ---------- HEADER ---------- */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-blue-firstRate">
              Register New Employee
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-xl"
            >
              ✕
            </button>
          </div>

          {error && <p className="mb-4 text-sm text-red-500">Error: {error}</p>}

          {/* ---------- FORM ---------- */}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            {/* Required */}
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="First name *"
              className={inputClass}
              required
            />
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Last name *"
              className={inputClass}
              required
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email *"
              className={inputClass}
              required
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone *"
              className={inputClass}
              required
            />

            {/* ✅ Date of Birth — picker + typable, with format hint */}
            <div>
              <label className={labelClass}>
                Date of Birth <span className="text-gray-400">(YYYY-MM-DD)</span>
              </label>
              <input
                name="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={handleChange}
                className={`${inputClass} w-full`}
              />
            </div>

            {/* Gender */}
            <div>
              <label className={labelClass}>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={`${inputClass} w-full`}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Address"
              className={inputClass}
            />

            {/* ✅ National ID — optional with example */}
            <input
              name="national_id"
              value={form.national_id}
              onChange={handleChange}
              placeholder="National ID (e.g. 1401-1234-5678)"
              className={inputClass}
            />

            {/* ✅ TIN — optional with example */}
            <input
              name="tin"
              type="number"
              value={form.tin ? "" : form.tin}
              onChange={handleChange}
              placeholder="TIN (e.g. 1234567890)"
              className={inputClass}
            />

            {/* ✅ Bank Account — optional with example */}
            <input
              name="bank_account"
              value={form.bank_account}
              onChange={handleChange}
              placeholder="Bank account (e.g. 0123456789)"
              className={inputClass}
            />

            {/* ---------- ACTIONS ---------- */}
            <div className="col-span-2 flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1.5 text-sm rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-firstRate hover:bg-blue-firstRate/90 text-white px-4 py-1.5 text-sm rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
