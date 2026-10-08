import { useState, useEffect } from "react";
import {
  updateEmployee,
  type CreateEmployeeType,
  type GetAllEmployeeType,
} from "../../api/employeeApi";

interface Props {
  isOpen: boolean;
  employee: GetAllEmployeeType | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateEmployeeModal({
  isOpen,
  employee,
  onClose,
  onSuccess,
}: Props) {
  const { update, loading, error } = updateEmployee();
  const [form, setForm] = useState<CreateEmployeeType | null>(null);

  // Fill form when employee changes / modal opens
  useEffect(() => {
    if (isOpen && employee) {
      setForm({
        first_name: employee.first_name,
        last_name: employee.last_name,
        date_of_birth: employee.date_of_birth,
        gender: employee.gender,
        status: employee.status,
        phone: employee.phone,
        email: employee.email,
        address: employee.address,
        national_id: employee.national_id,
        tin: employee.tin,
        bank_account: employee.bank_account,
      });
    }
  }, [isOpen, employee]);

  if (!isOpen || !employee || !form) return null;

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
    const ok = await update(employee.registration_id, form);
    if (ok) {
      onSuccess();
      onClose();
    }
  };

  const inputClass =
    "border border-gray-300 px-3 py-1.5 text-sm rounded-lg w-full " +
    "focus:outline-none focus:ring-2 focus:ring-blue-firstRate/40 " +
    "focus:border-blue-firstRate transition";

  const labelClass = "text-xs text-gray-600 mb-1 block";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        {/* ---------- HEADER ---------- */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-blue-firstRate">
            Update Employee #{employee.registration_id}
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
          {/* First name */}
          <div>
            <label className={labelClass}>First Name </label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="First name"
              className={inputClass}
              required
            />
          </div>

          {/* Last name */}
          <div>
            <label className={labelClass}>Last Name </label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Last name"
              className={inputClass}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className={inputClass}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>Phone </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className={inputClass}
              required
            />
          </div>

          {/* Date of Birth — picker + typable */}
          <div>
            <label className={labelClass}>
              Date of Birth <span className="text-gray-400">(YYYY-MM-DD)</span>
            </label>
            <input
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Gender */}
          <div>
            <label className={labelClass}>Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className={labelClass}>Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Address"
              className={inputClass}
            />
          </div>

          {/* National ID */}
          <div>
            <label className={labelClass}>National ID</label>
            <input
              name="national_id"
              value={form.national_id}
              onChange={handleChange}
              placeholder="e.g. 1401-1234-5678"
              className={inputClass}
            />
          </div>

          {/* TIN */}
          <div>
            <label className={labelClass}>TIN</label>
            <input
              name="tin"
              type="number"
              value={form.tin === 0 ? "" : form.tin}
              onChange={handleChange}
              placeholder="e.g. 1234567890"
              className={inputClass}
            />
          </div>

          {/* Bank Account */}
          <div>
            <label className={labelClass}>Bank Account</label>
            <input
              name="bank_account"
              value={form.bank_account}
              onChange={handleChange}
              placeholder="e.g. 0123456789"
              className={inputClass}
            />
          </div>

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
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
